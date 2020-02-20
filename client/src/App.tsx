import React from 'react';
import './App.css';
import { ChatMessage, ChatState } from './Interfaces/ChattingMessageInterface';
import { ChatContext } from './ChatContext';

class App extends React.Component {
  static contextType = ChatContext;

  state: ChatState = {
    messages: [
      {
        message: 'Welcome! the chat.',
        author: 'Bot',
        socketId: ''
      }
    ],
    input: ''
  }

  componentDidMount () {

    //initiate socket connection
    this.context.init();

    const observable = this.context.onMessage();

    observable.subscribe((m: ChatMessage) => {
      let messages = this.state.messages;
      messages.push(m);
      this.setState({ messages: messages });
    });
  }

  componentWillUnmount () {
    this.context.disconnect();
  }

  render () {

    const updateInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
      this.setState({ input: e.target.value });
    }

    const handleMessage = (): void => {

      const author: string = 'kkkk';

      if (this.state.input !== '') {
        this.context.send({
          message: this.state.input,
          author: author
        });
        this.setState({ input: '' });
      }
    };

    return (
      <div className="App">
        <div className="App-chatbox" id="chatbox">
          {this.state.messages.map((msg: ChatMessage) => {
            return (
              <div>
                <p>{JSON.stringify(msg)}</p>
              </div>
            );
          })}
        </div>
        <input className="App-Textarea" placeholder="Type your messsage here..." onChange={updateInput} value={this.state.input}/>
        <p>
          <button onClick={() => { handleMessage() }}>
            Send Message
          </button>
        </p>
      </div>
    );
  }
}

export default App;
