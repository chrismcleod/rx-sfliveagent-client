import { merge } from 'rxjs';

import { startSession } from '.';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BUTTON_ID: string;
      DEPLOYMENT_ID: string;
      HOST: string;
      ORGANIZATION_ID: string;
      VERSION: '42';
    }
  }
}

const intervals: any[] = [];

const config = {
  buttonId: process.env.BUTTON_ID,
  deploymentId: process.env.DEPLOYMENT_ID,
  host: process.env.HOST,
  organizationId: process.env.ORGANIZATION_ID,
  version: process.env.VERSION,
};

const visitor = {
  language: 'en',
  userAgent: 'Test',
  visitorName: 'Blip Blapperton',
  prechatDetails: [],
  prechatEntities: [],
  receiveQueueUpdates: true,
  screenResolution: '1900x1200',
  isPost: true,
};

const session = startSession(config, visitor);

merge(session.chasitorChatMessage$, session.chatMessage$).subscribe((event) => {
  console.log(event.message.name, ':', event.message.text);
});

session.availability$.subscribe(event => console.log(event.message.results[0].isAvailable ? 'online' : 'offline'));
session.chatEnded$.subscribe(() => console.log('ended by agent'));
session.chatEnd$.subscribe(() => {
  console.log('ended by user');
});
session.chatMessage$.subscribe(() => scheduleSend());
session.error$.subscribe(console.log);

const scheduleSend = () => setTimeout(async () => {
  console.log('sending...');
  await session.api.chasitorTyping();
  intervals.push(setTimeout(async () => await session.api.chasitorNotTyping(), 3000));
  intervals.push(setTimeout(async () => await session.api.chatMessage({ text: 'Hello' }), 5000));
}, Math.round(5000 * Math.random()));

intervals.push(setInterval(async () => {
  session.api.availability();
}, 3000));

setTimeout(async () => {
  session.api.chatEnd();
  intervals.forEach(clearInterval);
}, 40000);
