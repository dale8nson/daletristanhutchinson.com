import { getMessenger } from 'gatsby-worker';


const messenger = getMessenger();

messenger.onMessage(msg => {
  console.log(`message received by switchboard:`, msg);
})

onmessage = (e) => {
    console.log(e.data);
    switch (e.data) {
      case 'open-left-shoji':
        postMessage('open-left-shoji');
        break;
      default:
        break;
    }
  }