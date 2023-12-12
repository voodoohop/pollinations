import React, { useState, useEffect, useRef } from 'react';
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Paper, makeStyles } from '@material-ui/core';
import ReactMarkdown from 'react-markdown'; // Importing a react markdown package
import { useSpring, animated } from 'react-spring'; // Importing react spring for fluid motion
import { useScroll } from 'react-use'; // Importing react-use hook for scrolling

// import ./conversation_log_20231211_141146.json

import rawConversation from './conversation_log_20231211_203402.json';
import chatGPTIcon from './chatgpt.png'; // Importing the chatgpt icon
import yiIcon from './yi.svg'; // Importing the yi icon

// Filter repeated messages from conversation
const filterRepeatedMessages = (conversation) => {
  const seen = new Set();
  return conversation.filter((message) => {
    const duplicate = seen.has(message.message);
    seen.add(message.message);
    return !duplicate;
  });
};

// make all h1s h4s and go up to h6 everathing else stays h6
const markdownRenderer = {
  heading: ({level, children}) => {
    switch (level) {
      case 1:
        return <h4>{children}</h4>;
      case 2:
        return <h5>{children}</h5>;
      case 3:
        return <h6>{children}</h6>;
      default:
        return <h6>{children}</h6>;
    }
  },
};

const conversation = filterRepeatedMessages(rawConversation);

// Styles for the components
const useStyles = makeStyles({
  chatWindow: {
    minHeight: 400,
    maxHeight: 400,
    overflow: 'auto',
    width: '100%',
    minWidth: 500,
    maxWidth: 600,
    margin: 'auto',
    backgroundColor: '#fff', // Assuming a white background as in the screenshot
  },
  listItem: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  listItemRight: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  listItemCenter: {
    display: 'flex',
    justifyContent: 'center',
    color: 'gray',
  },
  avatarLeft: {
    marginRight: 10,
  },
  avatarRight: {
    marginLeft: 10,
  },
  markdownText: { // Style for markdown text
    fontSize: '0.8rem', // Making the font of the chat messages smaller
  },
});

const ChatWindow = () => {
    const [displayedMessages, setDisplayedMessages] = useState([]);
    const classes = useStyles();
    const scrollRef = useRef(null);
    
    useEffect(() => {
      // Function to add a message to the displayed messages every 2 seconds
      const interval = setInterval(() => {
        if (displayedMessages.length < conversation.length) {
          setDisplayedMessages(current => [...current, conversation[current.length]]);
        } else {
          clearInterval(interval);
        }
      }, 3500);
      
      return () => clearInterval(interval);
    }, [displayedMessages]);
    
    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight; // Scroll to bottom of chat window
      }
    }, [displayedMessages]);
  
    return (
      <Paper className={classes.chatWindow} ref={scrollRef}>
        <List>
          {displayedMessages.map((message, index) => {
            const isChatGPT = message.speaker === 'ChatGPT';
            const isYi = message.speaker === 'Yi';
            return (
              <ListItem key={index} className={isChatGPT ? classes.listItem : isYi ? classes.listItemRight : classes.listItemCenter}>
                {isChatGPT && (
                  <ListItemAvatar>
                    <Avatar className={classes.avatarLeft} src={chatGPTIcon} />
                  </ListItemAvatar>
                )}
                <ReactMarkdown 
                  className={classes.markdownText} 
                  // renderers={markdownRenderer}
                  components={markdownRenderer}
                > 
                {message.message}
                </ReactMarkdown>
                {isYi && (
                  <ListItemAvatar>
                    <Avatar className={classes.avatarRight} src={yiIcon} />
                  </ListItemAvatar>
                )}
              </ListItem>
            );
          })}
        </List>
      </Paper>
    );
  };
  
  export default ChatWindow;