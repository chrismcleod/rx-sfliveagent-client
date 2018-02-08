import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, CancelToken, CancelTokenSource } from 'axios';
import { PromiseQueue, createQueue } from 'rx-promise-queue';

import { Header, Messages, Requests, Responses } from './types';
const isAxiosError = (error: any): error is AxiosError => {
  return error.response && error.request;
};

export interface LiveagentConfig {
  host: string;
  version: '30' | '31' | '32' | '33' | '34' | '35' | '36' | '37' | '38' | '39' | '40' | '41' | '42';

  /** The ID of the Salesforce organization that’s associated with the Live Agent deployment */
  organizationId: string;

  /** The ID of theLive Agent deployment that the chat request was initiated from */
  deploymentId: string;
  buttonId: string;
}

export interface Visitor {
  id: string;
  name: string;
}

/**
 * Message long polling notifies you of events that occur on the Live Agent server for your Live Agent session.
 * When you start a request, all pending messages will be immediately delivered to your session. If there are no pending messages, the connection to the server will remain open. The connection will return messages continuously as they are received on the server.
 *
 * If your session expires, you will receive a 200 (“OK”) response code and a resource that contains an array of the remaining messages. If no messages were received, you will receive a 204 (“No Content”) response code.
 *
 * When you receive a 200 (“OK”) or 204 (“No Content”) response code, immediately perform another Messages request to continue to retrieve messages that are registered on the Live Agent server.
 * Warning
 * If you don’t make another Messages request to continue the messaging loop, your session will end after a system timeout on the Live Agent server.
 *
 * If you don’t receive a response within the number of seconds indicated by the clientPollTimeout property in your SessionId request, your network connection to the server is likely experiencing an error, so you should terminate the request.
 *
 * To initiate a long polling loop, perform a Messages request.
 */
export class Api {

  public visitor: Visitor;
  private config: LiveagentConfig;
  private sequence = 1;
  private ack = -1;
  private session = {} as Responses.SessionId;
  private client: AxiosInstance;
  private queue: PromiseQueue = createQueue();
  private clientCancelToken: CancelTokenSource = axios.CancelToken.source();

  constructor(config: LiveagentConfig) {
    this.config = config;
    this.visitor = { id: '', name: '' };
    this.client = axios.create({
      baseURL: this.config.host,
      headers: {
        [ Header.X_LIVEAGENT_API_VERSION ]: this.config.version || '42',
        Accept: 'content/json',
        'Content-Type': 'application/json',
      },
    });
  }

  /** Indicates whether a chat button is available to receive new chat requests. */
  availability = async (data?: Requests.Availability) => {
    const result = await this.makeRequest<{messages: {message: Responses.Availability}[]}>({
      url: '/chat/rest/Visitor/Availability',
      method: 'get',
      params: {
        org_id: this.config.organizationId,
        deployment_id: this.config.deploymentId,
        'Availability.ids': data && data.Availability && data.Availability.ids ? data.Availability.ids : this.config.buttonId,
      },
    });
    return {
      type: 'Availability',
      message: {
        results: result.messages[0].message.results,
      },
    } as Messages.Availability;
  }

  /** Sets a breadcrumb value to the URL of the Web page that the chat visitor is viewing as the visitor chats with an agent. The agent can then see the value of the breadcrumb to determine the page the chat visitor is viewing. */
  breadcrumb = async (data: Requests.Breadcrumb) => this.makeRequest<Responses.None>({
    data,
    url: '/chat/rest/Visitor/Breadcrumb',
    method: 'post',
  })

  /** Establishes a new Live Agent session. The SessionId request is required as the first request to create every new Live Agent session. */
  sessionId = async () => {
    this.session = await this.makeRequest<Responses.SessionId>({
      url: '/chat/rest/System/SessionId',
    });
  }

  /** Initiates a new chat visitor session. The ChasitorInit request is always required as the first POST request in a new chat session. */
  chasitorInit = async (data: Requests.ChasitorInit) => this.makeSessionRequest<Responses.None>({
    url: '/chat/rest/Chasitor/ChasitorInit',
    method: 'post',
    data: {
      buttonId: this.config.buttonId,
      deploymentId: this.config.deploymentId,
      organizationId: this.config.organizationId,
      sessionId: this.session.id,
      ...data,
    },
    sequence: true,
  })

  /**
   * Reestablishes a customer’s chat session on a new server if the session is interrupted and the original server is unavailable.
   * This request should only be made if you receive a 503 response status code, indicating that the affinity token has changed for your Live Agent session. When you receive a 503 response status code, you must cancel any existing inbound or outbound requests.
   *
   * The data in outbound requests will be temporarily stored and resent once the session is reestablished. Upon receiving the response for the ResyncSession request, you can start polling for messages if the isValid response property is true.
   *
   * The first response will be a ChasitorSessionData message containing the data from the previous session that will be restored once the session is reestablished. After receiving that message, you can proceed to send the existing messages that were cancelled upon receiving the 503 response status code.
   */
  resyncSession = async () => this.makeSessionRequest<Responses.ResyncSession>({
    url: '/chat/rest/Chasitor/ChasitorInit',
  })

  /** Reestablishes the chat visitor’s state, including the details of the chat, after a ResyncSession request is completed. */
  chasitorResyncState = async (data: Requests.ChasitorResyncState) => this.makeSessionRequest<Responses.ResyncSession>({
    data,
    url: '/chat/rest/Chasitor/ChasitorResyncState',
    method: 'post',
  })

  /** Indicates that the chat visitor is not typing in the chat window. */
  chasitorNotTyping = async () => this.makeSessionRequest<Responses.None>({
    data: {},
    url: '/chat/rest/Chasitor/ChasitorNotTyping',
    method: 'post',
    sequence: true,
  })

  /** Provides a chat visitor’s message that was viewable through Sneak Peek. */
  chasitorSneakPeek = async (data: Requests.ChasitorSneakPeak) => this.makeSessionRequest<Responses.None>({
    data,
    url: '/chat/rest/Chasitor/ChasitorSneakPeek',
    method: 'post',
    sequence: true,
  })

  /** Indicates that a chat visitor is typing a message in the chat window. */
  chasitorTyping = async () => this.makeSessionRequest<Responses.None>({
    data: {},
    url: '/chat/rest/Chasitor/ChasitorTyping',
    method: 'post',
    sequence: true,
  })

  /** Indicates that a chat visitor has ended the chat. */
  chatEnd = async () => {
    await this.makeSessionRequest<Responses.ChatEnd>({
      data: {
        reason: 'client',
      },
      url: '/chat/rest/Chasitor/ChatEnd',
      method: 'post',
      sequence: true,
    });
    this.clientCancelToken.cancel();
    return {
      type: 'ChatEnd',
      message: {},
    } as Messages.ChatEnd;
  }

  /** Returns the body of the chat message sent by the chat visitor. */
  chatMessage = async (data: Requests.ChatMessage) => {
    await this.makeSessionRequest<Responses.None>({
      data,
      url: '/chat/rest/Chasitor/ChatMessage',
      method: 'post',
      sequence: true,
    });
    return {
      type: 'ChasitorChatMessage',
      message: {
        text: data.text,
        name: this.visitor.name,
        agentId: this.visitor.id,
      },
    } as Messages.ChasitorChatMessage;
  }

  /** Indicates a custom event was sent from the chat visitor during the chat. */
  customEvent = async (data: Requests.CustomEvent) => this.makeSessionRequest<Responses.None>({
    data,
    url: '/chat/rest/Chasitor/CustomEvent',
    method: 'post',
    sequence: true,
  })

  /** Returns all messages that were sent between agents and chat visitors during a chat session. */
  messages = async () => {
    const response = await this.makeSessionRequest<Responses.Messages | void>({
      url: '/chat/rest/System/Messages',
      method: 'get',
      sequence: false,
      params: { ack: this.ack },
      useQueue: false,
    });
    if (response && response.sequence !== undefined) this.ack = response.sequence;
    return response;
  }

  /** Batches multiple POST requests together if you’re sending multiple messages at the same time. */
  multiNoun = async (data: Requests.MultiNoun) => this.makeSessionRequest<Responses.None>({
    data,
    url: '/chat/rest/System/MultiNoun',
    method: 'post',
    sequence: true,
  })

  /** Retrieves all settings information about the Live Agent deployment that’s associated with your chat session. The Settings request is required as the first request to establish a chat visitor’s session. */
  settings = async (data: Requests.Settings) => this.makeRequest<Responses.Settings>({
    url: '/chat/rest/Visitor/Settings',
    method: 'get',
    params: {
      org_id: this.config.organizationId,
      deployment_id: this.config.deploymentId,
      'Settings.buttonIds': data.Settings.buttonIds,
      'Settings.updateBreadcrumb': data.Settings.updateBreadcrumb,
    },
  })

  /** Generates a unique ID to track a chat visitor when they initiate a chat request and tracks the visitor’s activities as the visitor navigates from one Web page to another. */
  visitorId = async () => this.makeRequest<Responses.VisitorId>({
    url: '/chat/rest/Visitor/VisitorId',
    method: 'get',
    params: {
      org_id: this.config.organizationId,
      deployment_id: this.config.deploymentId,
    },
  })

  private makeRequest = async <T extends Responses.Any>(config: AxiosRequestConfig & Partial<Responses.SessionId> & { sequence?: boolean, useQueue?: boolean }) => {

    config.cancelToken = this.clientCancelToken.token;
    if (config.useQueue === undefined) config.useQueue = true;
    if (config && config.data && config.data.visitorName) this.visitor.name = config.data.visitorName;
    config.headers = config.headers || {};
    config.headers[ Header.X_LIVEAGENT_AFFINITY ] = config.affinityToken || 'null';
    if (config.key) config.headers[ Header.X_LIVEAGENT_SESSION_KEY ] = config.key;
    // if (config.sequence === true) config.headers[ Header.X_LIVEAGENT_SEQUENCE ] = this.sequence;

    try {
      const response = config.useQueue ? (
        await this.queue.add(() => this.client.request<Responses.Any>(config))
      ) : (
        await this.client.request<Responses.Any>(config)
      );
      // if (response && response.data && response.data.sequence !== undefined && config.sequence) this.sequence = (response.data as any).sequence;
      return response.data as T;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        switch (error.response.status) {
          case 400:
            error.message = 'The request couldn’t be understood, usually because the JSON body contains an error.';
            break;
          case 403:
            error.message = 'The request has been refused because the session isn’t valid.';
            break;
          case 404:
            error.message = 'The requested resource couldn’t be found. Check the URI for errors.';
            break;
          case 405:
            error.message = 'The method specified in the Request-Line isn’t allowed for the resource specified in the URI.';
            break;
          case 409:
            error.message = `There is a conflict, probably a message acked out of order. ${error.response.data}`;
            break;
          case 500:
            error.message = 'An error has occurred within the Live Agent server, so the request couldn’t be completed. Contact Customer Support.';
            break;
          case 503:
            error.message = 'The affinity token has changed. You must make a ResyncSession request to get a new affinity token and session key, then make a ChasitorSessionData request to reestablish the chat visitor’s data within the new session.';
            break;
          default:
            error.message = 'Unknown error.';
        }
      }
      throw error;
    }
  }

  private makeSessionRequest = async <T>(config: AxiosRequestConfig & Partial<Responses.SessionId> & { sequence?: boolean, useQueue?: boolean }) => {
    if (!this.session || !this.session.id || !this.session.key) throw new Error('Session is invalid.  You must start a session before calling this method.  This usually happens if you have tried to use an API method before calling the sessionId method.');
    try {
      const result = await this.makeRequest<T>({ ...config, ...this.session });
      if (config.sequence) this.sequence += 1;
      return result;
    } catch (error) {
      throw error;
    }
  }
}
