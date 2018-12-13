import { Observable, ReplaySubject, Subject, defer, from, merge, of } from 'rxjs';
import { catchError, concat, exhaustMap, filter, multicast, repeat, share, switchMap, take, takeWhile, tap } from 'rxjs/operators';

import { Api, LiveagentConfig } from './api';
import { Messages, Requests } from './types';

export type Wrapper<T1, T2> = {
  [P in (keyof T1 & keyof T2)]: T2[P]
};

type Predicate<T> = (value: T) => boolean;
type Thing<T> = (source: Observable<T>) => Observable<T>;

const takeWhileInclusive = <T>(predicate: Predicate<T>): Thing<T> => {
  return (source) => source.pipe(
    multicast(() =>
      new ReplaySubject<T>(1),
      (shared) => shared.pipe(
        takeWhile(predicate),
        concat(shared.pipe(
          take(1),
          filter((t) => !predicate(t)),
        )),
      ),
    ),
  );
};

const messages = (api: Api) => defer(() =>
  from(api.messages()).pipe(
    switchMap((response) => response ? response.messages : []),
    tap((message) => !api.visitor.id && message.type === 'ChatRequestSuccess' ? api.visitor.id = message.message.visitorId : undefined),
  ))
  .pipe(repeat());

export interface Session {

  api: Api;

  /**
   *  Stream of all messages received by the chat session
   */
  all$: Observable<
  | Messages.Availability
  | Messages.AgentDisconnect
  | Messages.AgentTyping
  | Messages.AgentNotTyping
  | Messages.ChasitorSessionData
  | Messages.ChatEnded
  | Messages.ChatEnd
  | Messages.ChatEstablished
  | Messages.ChatMessage
  | Messages.ChasitorChatMessage
  | Messages.ChatRequestFail
  | Messages.ChatRequestSuccess
  | Messages.ChatTransferred
  | Messages.CustomEvent
  | Messages.NewVisitorBreadcrumb
  | Messages.QueueUpdate
  | Error
  >;

  /**
   * The results of an availbity request with details about whether an agent is online for a button id.
   */
  availability$: Observable<Messages.Availability>;

  /**
   * Indicates that the agent has been disconnected from the chat.
   *
   * Though the agent has been disconnected from the chat, the chat session
   * is still active on the server. A new agent may accept the chat request
   * and continue the chat.
   */
  agentDisconnect$: Observable<Messages.AgentDisconnect>;

  /**
   * Indicates that the agent is typing a message to the chat visitor.
   */
  agentTyping$: Observable<Messages.AgentTyping>;

  /**
   * Indicates that the agent is not typing a message to the chat visitor.
   */
  agentNotTyping$: Observable<Messages.AgentNotTyping>;

  /**
   * Returns the current chat session data for the chat visitor. This request is used to
   * restore the session data for a chat visitor’s chat session after a ResyncSession
   * request is sent.
   *
   * The ChasitorSessionData request is the first message sent after a ResyncSession request is delivered.
   *
   * Note
   * No messages should be sent after a 503 status code is encountered until this message is processed.
   */
  chasitorSessionData$: Observable<Messages.ChasitorSessionData>;

  /**
   * Indicates that an agent has ended the chat.
   */
  chatEnded$: Observable<Messages.ChatEnded>;

  /**
   * Indicates that the user has ended the chat.
   */
  chatEnd$: Observable<Messages.ChatEnd>;

  /**
   * Indicates that an agent has accepted a chat request and is engaged in a chat with a visitor.
   */
  chatEstablished$: Observable<Messages.ChatEstablished>;

  /**
   * Indicates a new chat message has been sent from an agent to a chat visitor.
   */
  chatMessage$: Observable<Messages.ChatMessage>;

  /**
   * Indicates a new chat message has been sent from a chat visitor to an agent.
   */
  chasitorChatMessage$: Observable<Messages.ChasitorChatMessage>;

  /**
   * Indicates that the chat request was not successful.
   */
  chatRequestFail$: Observable<Messages.ChatRequestFail>;

  /**
   * Indicates that the chat request was successful and routed to available agents.
   *
   * Note
   * The ChatRequestSuccess response only indicates that a request has been routed to
   * available agents. The chat hasn’t been accepted until the ChatEstablished response
   * is received.
   */
  chatRequestSuccess$: Observable<Messages.ChatRequestSuccess>;

  /**
   * Indicates the chat was transferred from one agent to another.
   */
  chatTransferred$: Observable<Messages.ChatTransferred>;

  /**
   * Indicates a custom event was sent from an agent to a chat visitor during a chat.
   */
  customEvent$: Observable<Messages.CustomEvent>;

  /**
   * Indicates the URL of the Web page the chat visitor is currently viewing.
   */
  newVisitorBreadcrumb$: Observable<Messages.NewVisitorBreadcrumb>;

  /**
   * Indicates the new position of the chat visitor in the chat queue when the visitor’s position in the queue changes.
   */
  queueUpdate$: Observable<Messages.QueueUpdate>;

  /**
   * Indicates an unknown error ocurred in the chat stream.
   */
  error$: Observable<Error>;
}

export const startSession = (config: LiveagentConfig, visitorDetails: Requests.ChasitorInit): Session => {

  const internal = new Subject<Messages.All>();
  const promiseApi = new Api(config);
  const api: Api = {} as any;

  Object.keys(promiseApi).forEach((key) => {

    const whitelist = [
      'availability',
      'breadcrumb',
      'chasitorInit',
      'resyncSession',
      'chasitorResyncState',
      'chasitorNotTyping',
      'chasitorSneakPeek',
      'chasitorTyping',
      'chatEnd',
      'chatMessage',
      'customEvent',
      'multiNoun',
      'settings',
      'visitorId',
    ];

    if (whitelist.includes(key) === false) {
      (api as any)[key] = (promiseApi as any)[key];
      return;
    }

    (api as any)[key] = async (...args: any[]) => {
      try {
        const result = await (promiseApi as any)[key](...args);
        internal.next(result);
        return result;
      } catch (error) {
        internal.next(error);
      }
    };
  });

  const all$ = merge(internal, of(api).pipe(
    exhaustMap(() => from(api.sessionId())),
    exhaustMap(() => from(api.chasitorInit(visitorDetails))),
    exhaustMap(() => messages(api)),
    catchError((error: Error) => of(error)),
  )).pipe(
    takeWhileInclusive((event) => event instanceof Error || (event.type !== 'ChatEnd' && event.type !== 'ChatEnded')),
    share(),
  );

  const availability$ = all$.pipe(filter((event) => !(event instanceof Error) && event.type === 'Availability')) as Observable<Messages.Availability>;
  const agentDisconnect$ = all$.pipe(filter((event) => !(event instanceof Error) && event.type === 'AgentDisconnect')) as Observable<Messages.AgentDisconnect>;
  const agentTyping$ = all$.pipe(filter((event) => !(event instanceof Error) && event.type === 'AgentTyping')) as Observable<Messages.AgentTyping>;
  const agentNotTyping$ = all$.pipe(filter((event) => !(event instanceof Error) && event.type === 'AgentNotTyping')) as Observable<Messages.AgentNotTyping>;
  const chasitorSessionData$ = all$.pipe(filter((event) => !(event instanceof Error) && event.type === 'ChasitorSessionData')) as Observable<Messages.ChasitorSessionData>;
  const chatEnded$ = all$.pipe(filter((event) => !(event instanceof Error) && event.type === 'ChatEnded')) as Observable<Messages.ChatEnded>;
  const chatEnd$ = all$.pipe(filter((event) => !(event instanceof Error) && event.type === 'ChatEnd')) as Observable<Messages.ChatEnd>;
  const chatEstablished$ = all$.pipe(filter((event) => !(event instanceof Error) && event.type === 'ChatEstablished')) as Observable<Messages.ChatEstablished>;
  const chatMessage$ = all$.pipe(filter((event) => !(event instanceof Error) && event.type === 'ChatMessage')) as Observable<Messages.ChatMessage>;
  const chasitorChatMessage$ = all$.pipe(filter((event) => !(event instanceof Error) && event.type === 'ChasitorChatMessage')) as Observable<Messages.ChasitorChatMessage>;
  const chatRequestFail$ = all$.pipe(filter((event) => !(event instanceof Error) && event.type === 'ChatRequestFail')) as Observable<Messages.ChatRequestFail>;
  const chatRequestSuccess$ = all$.pipe(filter((event) => !(event instanceof Error) && event.type === 'ChatRequestSuccess')) as Observable<Messages.ChatRequestSuccess>;
  const chatTransferred$ = all$.pipe(filter((event) => !(event instanceof Error) && event.type === 'ChatTransferred')) as Observable<Messages.ChatTransferred>;
  const customEvent$ = all$.pipe(filter((event) => !(event instanceof Error) && event.type === 'CustomEvent')) as Observable<Messages.CustomEvent>;
  const newVisitorBreadcrumb$ = all$.pipe(filter((event) => !(event instanceof Error) && event.type === 'NewVisitorBreadcrumb')) as Observable<Messages.NewVisitorBreadcrumb>;
  const queueUpdate$ = all$.pipe(filter((event) => !(event instanceof Error) && event.type === 'QueueUpdate')) as Observable<Messages.QueueUpdate>;
  const error$ = all$.pipe(filter((event) => event instanceof Error)) as Observable<Error>;

  return {
    api,
    all$,
    availability$,
    agentDisconnect$,
    agentTyping$,
    agentNotTyping$,
    chasitorSessionData$,
    chatEnded$,
    chatEnd$,
    chatEstablished$,
    chatMessage$,
    chasitorChatMessage$,
    chatRequestFail$,
    chatRequestSuccess$,
    chatTransferred$,
    customEvent$,
    newVisitorBreadcrumb$,
    queueUpdate$,
    error$,
  };
};
