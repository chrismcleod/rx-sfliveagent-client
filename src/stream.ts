import { Observable, ReplaySubject, Subject, defer, from, merge, of } from 'rxjs';
import { catchError, concat, exhaustMap, filter, multicast, repeat, share, switchMap, take, takeWhile, tap } from 'rxjs/operators';

import { Api, LiveagentConfig } from './api';
import { Messages, Requests, Responses } from './types';

export type Wrapper<T1, T2> = {
  [ P in (keyof T1 & keyof T2) ]: T2[ P ]
};

type Predicate<T> = (value: T) => boolean;
type Thing<T> = (source: Observable<T>) => Observable<T>;

const takeWhileInclusive = <T>(predicate: Predicate<T>): Thing<T> => {
  return source => source.pipe(
    multicast(() =>
      new ReplaySubject<T>(1),
      shared => shared.pipe(
        takeWhile(predicate),
        concat(shared.pipe(
          take(1),
          filter(t => !predicate(t)),
        )),
      ),
    ),
  );
};

const messages = (api: Api) => defer(() =>
  from(api.messages()).pipe(
    switchMap(response => response ? response.messages : []),
    tap(message => !api.visitor.id && message.type === 'ChatRequestSuccess' ? api.visitor.id = message.message.visitorId : undefined),
  ))
  .pipe(repeat());

export type LiveagentSession = ReturnType<typeof startSession>;
export const startSession = (config: LiveagentConfig, visitorDetails: Requests.ChasitorInit) => {

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
    takeWhileInclusive(event => event instanceof Error || (event.type !== 'ChatEnd' && event.type !== 'ChatEnded')),
    share(),
  );

  const availability$ = all$.pipe(filter(event => !(event instanceof Error) && event.type === 'Availability')) as Observable<Messages.Availability>;
  const agentDisconnect$ = all$.pipe(filter(event => !(event instanceof Error) && event.type === 'AgentDisconnect')) as Observable<Messages.AgentDisconnect>;
  const agentTyping$ = all$.pipe(filter(event => !(event instanceof Error) && event.type === 'AgentTyping')) as Observable<Messages.AgentTyping>;
  const agentNotTyping$ = all$.pipe(filter(event => !(event instanceof Error) && event.type === 'AgentNotTyping')) as Observable<Messages.AgentNotTyping>;
  const chasitorSessionData$ = all$.pipe(filter(event => !(event instanceof Error) && event.type === 'ChasitorSessionData')) as Observable<Messages.ChasitorSessionData>;
  const chatEnded$ = all$.pipe(filter(event => !(event instanceof Error) && event.type === 'ChatEnded')) as Observable<Messages.ChatEnded>;
  const chatEnd$ = all$.pipe(filter(event => !(event instanceof Error) && event.type === 'ChatEnd')) as Observable<Messages.ChatEnd>;
  const chatEstablished$ = all$.pipe(filter(event => !(event instanceof Error) && event.type === 'ChatEstablished')) as Observable<Messages.ChatEstablished>;
  const chatMessage$ = all$.pipe(filter(event => !(event instanceof Error) && event.type === 'ChatMessage')) as Observable<Messages.ChatMessage>;
  const chasitorChatMessage$ = all$.pipe(filter(event => !(event instanceof Error) && event.type === 'ChasitorChatMessage')) as Observable<Messages.ChasitorChatMessage>;
  const chatRequestFail$ = all$.pipe(filter(event => !(event instanceof Error) && event.type === 'ChatRequestFail')) as Observable<Messages.ChatRequestFail>;
  const chatRequestSuccess$ = all$.pipe(filter(event => !(event instanceof Error) && event.type === 'ChatRequestSuccess')) as Observable<Messages.ChatRequestSuccess>;
  const chatTransferred$ = all$.pipe(filter(event => !(event instanceof Error) && event.type === 'ChatTransferred')) as Observable<Messages.ChatTransferred>;
  const customEvent$ = all$.pipe(filter(event => !(event instanceof Error) && event.type === 'CustomEvent')) as Observable<Messages.CustomEvent>;
  const newVisitorBreadcrumb$ = all$.pipe(filter(event => !(event instanceof Error) && event.type === 'NewVisitorBreadcrumb')) as Observable<Messages.NewVisitorBreadcrumb>;
  const queueUpdate$ = all$.pipe(filter(event => !(event instanceof Error) && event.type === 'QueueUpdate')) as Observable<Messages.QueueUpdate>;
  const error$ = all$.pipe(filter(event => event instanceof Error)) as Observable<Error>;

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
