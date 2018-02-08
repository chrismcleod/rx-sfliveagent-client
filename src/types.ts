import * as Axios from 'axios';
export { Axios };
export type Path = string;
export type SessionId = string;
export type SessionKey = string;
export type SequenceId = string;
export type ApiVersion = string;
export type AffinityToken = string;

export enum Header {
  X_LIVEAGENT_API_VERSION = 'X-LIVEAGENT-API-VERSION',
  X_LIVEAGENT_AFFINITY = 'X-LIVEAGENT-AFFINITY',
  X_LIVEAGENT_SESSION_KEY = 'X-LIVEAGENT-SESSION-KEY',
  X_LIVEAGENT_SEQUENCE = 'X-LIVEAGENT-SEQUENCE',
}

export namespace DataTypes {

  export interface Button {
    /** The ID of the chat button object.	*/
    id: string;

    /** The button type */
    type: 'Standard' | 'Invite' | 'ToAgent';

    /** The URL of the custom chat window that’s assigned to the chat button.	*/
    endpointUrl?: string;

    /** The URL of the pre-chat form that’s assigned to the button.	*/
    prechatUrl?: string;

    /** The chat button’s default language.	*/
    langauge?: string;

    /** Specifies whether the chat button is available to receive new chat requests (true) or not (false). */
    isAvailable: boolean;

    /** The URL to the automated invitation’s static image resource. */
    inviteImageUrl?: string;

    /** The width in pixels of the automated chat invitation’s image.	*/
    inviteImageWidth?: number;

    /** The height in pixels of the automated chat invitation’s image.	*/
    inviteImageHeight?: number;

    /** The animation option that’s assigned to the automated chat invitation */
    inviteRenderer?: 'Slide' | 'Fade' | 'Appear' | 'Custom';

    /** The position at which the automated chat invitation begins its animation. */
    inviteStartPosition?: 'TopLeft' | 'TopLeftTop' | 'Top' | 'TopRightTop' | 'TopRight' | 'TopRightRight' | 'Right' | 'BottomRightRight' | 'BottomRight' | 'BottomRightBottom' | 'Bottom' | 'BottomLeftBottom' | 'BottomLeft' | 'BottomLeftLeft' | 'Left' | 'TopLeftLeft';

    /** The position at which the automated chat invitation begins its animation. */
    inviteEndPosition?: 'TopLeft' | 'Top' | 'TopRight' | 'Left' | 'Center' | 'Right' | 'BottomLeft' | 'Bottom' | 'BottomRight';

    /** Specifies whether the automated chat invitation can be sent again after the customer accepted a previous chat invitation (true) or not (false). */
    hasInviteAfterAccept?: boolean;

    /** Specifies whether the automated chat invitation can be sent again after the customer rejected a previous chat invitation (true) or not (false). */
    hasInviteAfterReject?: boolean;

    /** The amount of time in seconds that the invitation will appear on a customer’s screen before the invitation is automatically rejected. */
    inviteRejectTime?: number;

    /** The custom rules that govern the behavior of the automated chat invitation, as defined in your custom Apex class. */
    inviteRules?: any;
  }

  export interface CustomDetail {
    /** The customized label for the detail.	*/
    label: string;

    /** The customized value for the detail. */
    value: string;

    /** The names of fields to which to save the customer’s details on the chat transcript.	*/
    transcriptFields: string[];

    /** Specifies whether to display the customized detail to the agent (true) or not (false).	*/
    displayToAgent?: boolean;
  }

  export interface Entity {
    /** The record to search for or create.	*/
    entityName: string;

    /** Specifies whether to display the record after it’s created(true) or not(false).	*/
    showOnCreate?: boolean;

    /** The fields to which to associate the detail on a record.	*/
    entityFieldsMap: EntityFieldMaps[];

    /** The name of the record to which to link the detail.	*/
    linkToEntityName?: string;

    /** The field within the record to which to link the detail. */
    linkToEntityField?: string;

    /** The name of the transcript field to which to save the record.	*/
    saveToTranscript?: string;
  }

  export interface EntityFieldMaps {
    /** The name of the field to which to associate the detail.	*/
    fieldName: string;

    /** The customized label for the detail. */
    label: string;

    /** Specifies whether to use the field fieldName to perform a search for matching records (true) or not (false). */
    doFind: boolean;

    /** Specifies whether to only search for records that have fields that exactly match the field fieldName (true) or not (false).	*/
    isExactMatch: boolean;

    /** Specifies whether to create a record based on the field fieldName if one doesn’t exist (true) or not (false).	*/
    doCreate: boolean;
  }

  export interface GeoLocation {
    /** The ISO 3166-1 alpha-2 country code for the chat visitor's location.	*/
    countryCode: string;

    /** The name of the country that’s associated with the chat visitor’s location.	*/
    countryName: string;

    /** The principal administrative division associated with the chat visitor's location—for example, the state or province.	*/
    region?: string;

    /** The name of the city associated with the chat visitor’s location.	*/
    city?: string;

    /** The name of the organization associated with the chat visitor’s location.	*/
    organization?: string;

    /** The latitude associated with the chat visitor’s location.	*/
    latitude?: number;

    /** The longitude associated with the chat visitor’s location. */
    longitude?: number;
  }

  export interface NounWrapper {
    /** The prefix of the resource.	*/
    prefix: string;

    /** The name of the resource.	*/
    noun: string;

    /** The data to post to the resource.	*/
    data?: string;
  }

  export interface Result {
    /** The Salesforce ID of the agent or chat button. */
    id: string;

    /** Indicates whether the entity that’s associated with the Salesforce ID id is available to receive new chat requests (true) or not (false). */
    isAvailable: boolean;
  }

  export interface TranscriptEntry {
    /** The type of message in the chat transcript. */
    type: 'Agent' | 'Chasitor' | 'OperatorTransferred';

    /** The name of the person who sent the chat message.	*/
    name: string;

    /** The body of the message. */
    content: string;

    /** The date and time when the message was sent. */
    timestamp: number;

    /** The sequence in which the message was received in the chat. */
    sequence: number;
  }

}

export namespace Requests {

  export interface Availability {
    Availability?: {
      /** An array of object IDs for which to verify availability. */
      ids: string[],
    };
  }

  export interface Breadcrumb {
    /** The URL of the Web page that the chat visitor is viewing. */
    location: string;
  }

  export interface ChasitorInit {
    /** The chat visitor’s Salesforce organization ID.	*/
    organizationId?: string;

    /** The ID of the deployment from which the chat originated.	*/
    deploymentId?: string;

    /** The ID of the button from which the chat originated. */
    buttonId?: string;

    /** The chat visitor’s Live Agent session ID.	*/
    sessionId?: string;

    /** The chat visitor’s browser user agent. */
    userAgent?: string;

    /** The button override rules that indicate how a chat request will be rerouted. */
    buttonOverrides?: string[];

    /** The resolution of the chat visitor’s computer screen. */
    screenResolution: string;

    /** The chat visitor’s spoken language.	*/
    language: string;

    /** The chat visitor’s custom name.	*/
    visitorName: string;

    /** The pre-chat information that was provided by the chat visitor.	*/
    prechatDetails: DataTypes.CustomDetail[];

    /** The records to create when a chat visitor begins a chat. */
    prechatEntities: DataTypes.Entity[];

    /** Indicates whether the chat visitor will receive queue position updates (true) or not (false).	*/
    receiveQueueUpdates: boolean;

    /** Indicates whether the chat request was made properly through a POST request (true) or not (false). */
    isPost: boolean;
  }

  export interface ResyncSession {
    /** The chat session ID from the SessionId request. */
    sessionId: SessionId;
  }

  export interface ChasitorResyncState {
    /** The chat visitor’s Salesforce organization ID. */
    organizationId: string;
  }

  export interface ChasitorSneakPeak {

    /** The position of the Sneak Peek update in the chat.	*/
    position: number;

    /** The text that the chat visitor is typing in the text input area of the chat window.	*/
    test: string;
  }

  export interface ChatEnded {
    /** Include the reason parameter in the request body of your request to specify the reason that the chat ended. */
    reason: string;
  }

  export interface ChatEnd {
    /** Include the reason parameter in the request body of your request to specify the reason that the chat ended. */
    reason: string;
  }

  export interface ChatMessage {
    /** The text of the chat visitor’s message to the agent. */
    text: string;
  }

  export interface CustomEvent {
    /** The type of custom event that occurred, used for adding the event listener on the agent’s side.	*/
    type: string;

    /** Data that’s relevant to the event that was sent to the agent.	*/
    data: string;
  }

  export interface MultiNoun {
    /** An array of noun objects and their properties that are batched in the MultiNoun request. */
    nouns: DataTypes.NounWrapper[];
  }

  export interface Settings {
    Settings: {
      /** An array of chat button IDs for which to retrieve settings information */
      buttonIds: string[]

      /** Indicates whether to update the chat visitor’s location with the URL of the Web page that the visitor is viewing */
      updateBreadcrumb: boolean,
    };
  }

  export interface VisitorId {}

  export type Any =
    | Availability
    | Breadcrumb
    | ChasitorInit
    | ResyncSession
    | ChasitorResyncState
    | ChasitorSneakPeak
    | ChatEnded
    | ChatMessage
    | CustomEvent
    | MultiNoun
    | Settings
    | VisitorId;

  export interface Adapter {
    availability: (data: Requests.Availability) => Promise<Responses.Availability>;
    breadcrumb: () => Promise<Responses.None>;
    sessionId: () => Promise<Responses.SessionId>;
    chasitorInit: () => Promise<Responses.None>;
    resyncSession: (data: Requests.ResyncSession) => Promise<Responses.ResyncSession>;
    chasitorResyncState: () => Promise<Responses.None>;
    chasitorSneakPeek: () => Promise<Responses.None>;
    chasitorTyping: () => Promise<Responses.None>;
    chatEnd: (data: Requests.ChatEnded) => Promise<Responses.ChatEnded>;
    chatMessage: (data: Requests.ChatMessage) => Promise<Responses.ChatMessage>;
    customEvent: (data: Requests.CustomEvent) => Promise<Responses.CustomEvent>;
    messages: () => Promise<Responses.Messages>;
    multiNoun: () => Promise<Responses.None>;
    settings: (data: Requests.Settings) => Promise<Responses.Settings>;
    visitorId: (data: Requests.VisitorId) => Promise<Responses.VisitorId>;
  }

}

export namespace Responses {

  export interface None { }

  export interface Availability {
    /** A list of Salesforce IDs that correspond to agents and chat buttons and their respective availability to receive new chat requests. */
    results: DataTypes.Result[];
  }

  export interface AgentDisconnect { }

  export interface AgentTyping { }

  export interface AgentNotTyping { }

  export interface ChasitorSessionData {
    /** he position of the chat visitor in the chat queue. */
    queuePosition: number;

    /** The chat visitor's location, based on the IP address from which the request originated. */
    geoLocation: DataTypes.GeoLocation;

    /** The URL that the chat visitor is visiting.*/
    url: string;

    /** The original URL that the chat request came from.	 */
    oref: string;

    /** The URL to which to redirect the chat visitor after the chat has ended.	*/
    postChatUrl: string;

    /** Whether Sneak Peek is enabled for the agent who accepts the chat.	*/
    sneakPeakEnabled: boolean;

    /** The chat message structure that’s synchronized across the agent.js and chasitor.js files. */
    chatMessages: DataTypes.TranscriptEntry[];
  }

  export interface ChasitorIdleTimeoutWarningEvent {
    /** Informs the server when a warning is triggered or cleared. Possible values: triggered and cleared. */
    idleTimeoutWarningEvent: string;
  }

  export interface ChatEstablished {
    /** The name of the agent who is engaged in the chat.	*/
    name: string;

    /** The user ID of the agent who is engaged in the chat.	*/
    userId: string;

    /** Whether Sneak Peek is enabled for the agent who accepts the chat.	*/
    sneakPeakEnabled: boolean;

    /** Gives the settings for chat visitor idle time-out. */
    chasitorIdleTimeout: number;
  }

  export interface ChatEnded {
    /** Includes attached record IDs */
    attachedRecords: string[];
  }

  export interface ChatEnd {}

  export interface ChatMessage {
    /** The name of the agent who is engaged in the chat. */
    name: string;

    /** The text of the chat message that the agent sent to the chat visitor.	*/
    text: string;

    /** The id of the agent that sent the chat message.	*/
    agentId: string;
  }

  export interface ChatRequestFail {
    /** The reason why the chat request failed—for example, no agents were available to chat or an internal error occurred. */
    reason: string;

    /** The URL of the post-chat page to which to redirect the chat visitor after the chat has ended. */
    postChatUrl: string;
  }

  export interface ChatRequestSuccess {
    /** The position of the chat visitor in the chat queue. */
    queuePosition: number;

    /** The chat visitor's location, based on the IP address from which the request originated.	*/
    geoLocation: DataTypes.GeoLocation;

    /** The URL that the chat visitor is visiting. */
    url: string;

    /** The original URL that the chat request came from. */
    oref: string;

    /** The URL to which to redirect the chat visitor after the chat has ended.	*/
    postChatUrl: string;

    /** The custom details of the deployment from which the chat request was initiated.	*/
    customDetails: DataTypes.CustomDetail[];

    /** The ID of the chat visitor.	 */
    visitorId: string;
  }

  export interface ChatTransferred {
    /** The name of the agent to whom the chat was transferred. */
    name: string;

    /** The ID of the chat visitor.	*/
    userId: string;

    /** Whether Sneak Peek is enabled for the agent to whom the chat was transferred.	*/
    sneakPeekEnabled: boolean;

    /** Gives the settings for chat visitor idle time-out.	*/
    chasitorIdleTimeout: number;
  }

  export interface CustomEvent {
    /** The type of custom event that occurred, used for adding the event listener on the chat visitor’s side.	*/
    type: string;

    /** Data that’s relevant to the event that was sent to the chat visitor.	*/
    data: string;
  }

  export interface Messages {
    /** The messages that was sent over the course of a chat. */
    messages: Messages.All[];

    /** The sequence of the message as it was received over the course of a chat.	*/
    sequence: number;
  }

  export interface NewVisitorBreadcrumb {
    /** The URL of the Web page that the chat visitor is viewing.	*/
    location: string;
  }

  export interface QueueUpdate {
    /** The updated position of the chat visitor in the chat queue.	*/
    position: number;
  }

  export interface ResyncSession {
    /** Indicates whether the session is valid (true) or not (false).	*/
    isValid: boolean;

    /** The session key for the new session after the old session has been reestablished.	*/
    key: SessionKey;

    /** The affinity token for the session that’s passed in the header for all future requests.	*/
    affinityToken: AffinityToken;
  }

  export interface SessionId {
    /** The session ID for the new session.	*/
    id: SessionId;

    /** The session key for the new session. */
    key: SessionKey;

    /** The affinity token for the session that’s passed in the header for all future requests. */
    affinityToken: AffinityToken;

    /** The number of seconds before you must make a Messages request before your Messages long polling loop times out and is terminated.	*/
    clientPollTimeout: number;
  }

  export interface Settings {
    /** The rate at which the visitor must ping the server to maintain the Live Agent visitor session.	*/
    pingrate: number;

    /** The URL of the content server.	*/
    contentServerUrl: string;

    /** A list of chat buttons, along with their settings information, that were specified when you made the Settings request. */
    button: DataTypes.Button[];
  }

  /** This response is returned for requests to Visitor resources if the Live Agent instance URL is not correct for the Organization ID provided. */
  export interface SwitchServer {
    /** The new Live Agent API endpoint for your org if your org is moved. It can be moved due to a planned org migration or during a Site Switch to a different instance. */
    newUrl: string;
  }

  export interface VisitorId {
    /** The session ID for the new session.	*/
    sessionId: string;
  }

  export type Any =
    | None
    | Availability
    | AgentDisconnect
    | AgentTyping
    | AgentNotTyping
    | ChasitorSessionData
    | ChasitorIdleTimeoutWarningEvent
    | ChatEstablished
    | ChatEnded
    | ChatMessage
    | ChatRequestFail
    | ChatRequestSuccess
    | ChatTransferred
    | CustomEvent
    | Messages
    | NewVisitorBreadcrumb
    | QueueUpdate
    | ResyncSession
    | SessionId
    | Settings
    | SwitchServer;
}

export namespace Messages {

  /**
   * The results of an availbity request with details about whether an agent is online for a button id.
   **/
  export type Availability = Message<typeof AVAILABILITY, Responses.Availability>;
  export const AVAILABILITY = 'Availability';

  /**
   * Indicates that the agent has been disconnected from the chat.
   *
   * Though the agent has been disconnected from the chat, the chat session
   * is still active on the server. A new agent may accept the chat request
   * and continue the chat.
   **/
  export type AgentDisconnect = Message<typeof AGENT_DISCONNECT, Responses.AgentDisconnect>;
  export const AGENT_DISCONNECT = 'AgentDisconnect';

  /**
   * Indicates that the agent is typing a message to the chat visitor.
   **/
  export type AgentTyping = Message<typeof AGENT_TYPING, Responses.AgentTyping>;
  export const AGENT_TYPING = 'AgentTyping';

  /**
   * Indicates that the agent is not typing a message to the chat visitor.
   **/
  export type AgentNotTyping = Message<typeof AGENT_NOT_TYPING, Responses.AgentNotTyping>;
  export const AGENT_NOT_TYPING = 'AgentNotTyping';

  /**
   * Returns the current chat session data for the chat visitor. This request is used to
   * restore the session data for a chat visitor’s chat session after a ResyncSession
   * request is sent.
   *
   * The ChasitorSessionData request is the first message sent after a ResyncSession request is delivered.
   *
   * Note
   * No messages should be sent after a 503 status code is encountered until this message is processed.
   **/
  export type ChasitorSessionData = Message<typeof CHASITOR_SESSION_DATA, Responses.ChasitorSessionData>;
  export const CHASITOR_SESSION_DATA = 'ChasitorSessionData';

  /**
   * Indicates that an agent has ended the chat.
   **/
  export type ChatEnded = Message<typeof CHAT_ENDED, Responses.ChatEnded>;
  export const CHAT_ENDED = 'ChatEnded';

  /**
   * Indicates that the user has ended the chat.
   **/
  export type ChatEnd = Message<typeof CHAT_END, Responses.ChatEnd>;
  export const CHAT_END = 'ChatEnd';

  /**
   * Indicates that an agent has accepted a chat request and is engaged in a chat with a visitor.
   **/
  export type ChatEstablished = Message<typeof CHAT_ESTABLISHED, Responses.ChatEstablished>;
  export const CHAT_ESTABLISHED = 'ChatEstablished';

  /**
   * Indicates a new chat message has been sent from an agent to a chat visitor.
   **/
  export type ChatMessage = Message<typeof CHAT_MESSAGE, Responses.ChatMessage>;
  export const CHAT_MESSAGE = 'ChatMessage';

  /**
   * Indicates a new chat message has been sent from a chat visitor to an agent.
   **/
  export type ChasitorChatMessage = Message<typeof CHASITOR_CHAT_MESSAGE, Responses.ChatMessage>;
  export const CHASITOR_CHAT_MESSAGE = 'ChasitorChatMessage';

  /**
   * Indicates that the chat request was not successful.
   **/
  export type ChatRequestFail = Message<typeof CHAT_REQUEST_FAIL, Responses.ChatRequestFail>;
  export const CHAT_REQUEST_FAIL = 'ChatRequestFail';

  /**
   * Indicates that the chat request was successful and routed to available agents.
   *
   * Note
   * The ChatRequestSuccess response only indicates that a request has been routed to
   * available agents. The chat hasn’t been accepted until the ChatEstablished response
   * is received.
   **/
  export type ChatRequestSuccess = Message<typeof CHAT_REQUEST_SUCCESS, Responses.ChatRequestSuccess>;
  export const CHAT_REQUEST_SUCCESS = 'ChatRequestSuccess';

  /**
   * Indicates the chat was transferred from one agent to another.
   **/
  export type ChatTransferred = Message<typeof CHAT_TRANSFERRED, Responses.ChatTransferred>;
  export const CHAT_TRANSFERRED = 'ChatTransferred';

  /**
   * Indicates a custom event was sent from an agent to a chat visitor during a chat.
   **/
  export type CustomEvent = Message<typeof CUSTOM_EVENT, Responses.CustomEvent>;
  export const CUSTOM_EVENT = 'CustomEvent';

  /**
   * Indicates the URL of the Web page the chat visitor is currently viewing.
   **/
  export type NewVisitorBreadcrumb = Message<typeof NEW_VISITOR_BREADCRUMB, Responses.NewVisitorBreadcrumb>;
  export const NEW_VISITOR_BREADCRUMB = 'NewVisitorBreadcrumb';

  /**
   * Indicates the new position of the chat visitor in the chat queue when the visitor’s position in the queue changes.
   **/
  export type QueueUpdate = Message<typeof QUEUE_UPDATE, Responses.QueueUpdate>;
  export const QUEUE_UPDATE = 'QueueUpdate';

  export interface Message<TType = any, TMessage = any> {
    type: TType;
    message: TMessage;
  }

  export type AllTypes =
    | typeof AVAILABILITY
    | typeof AGENT_DISCONNECT
    | typeof AGENT_TYPING
    | typeof AGENT_NOT_TYPING
    | typeof CHASITOR_SESSION_DATA
    | typeof CHAT_ENDED
    | typeof CHAT_END
    | typeof CHAT_ESTABLISHED
    | typeof CHAT_MESSAGE
    | typeof CHASITOR_CHAT_MESSAGE
    | typeof CHAT_REQUEST_FAIL
    | typeof CHAT_REQUEST_SUCCESS
    | typeof CHAT_TRANSFERRED
    | typeof CUSTOM_EVENT
    | typeof NEW_VISITOR_BREADCRUMB
    | typeof QUEUE_UPDATE;

  export type All =
    | Availability
    | AgentDisconnect
    | AgentTyping
    | AgentNotTyping
    | ChasitorSessionData
    | ChatEnded
    | ChatEnd
    | ChatEstablished
    | ChatMessage
    | ChasitorChatMessage
    | ChatRequestFail
    | ChatRequestSuccess
    | ChatTransferred
    | CustomEvent
    | NewVisitorBreadcrumb
    | QueueUpdate;
}
