import { Component } from '@angular/core';

import { Conversations } from './conversations/conversations';
import { MessageArea } from './message-area/message-area';
import { MessageInput } from './message-input/message-input';


@Component({
  selector: 'app-chat',
  imports: [Conversations, MessageArea, MessageInput],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat {

}
