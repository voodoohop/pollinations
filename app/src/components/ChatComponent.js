import React, { useState } from 'react';
import { usePollinationsText } from '@pollinations/react';


const ChatComponent = () => {
    const [input, setInput] = useState('');
    const [image, setImage] = useState(null);
    const [prompt, setPrompt] = useState(null);
    const response = usePollinationsText(prompt);

    const handleSend = () => {
        const messageData = [
            {
                "type": "text",
                "text": input
            }, {
                "type": "image_url",
                "image_url": { "url": image }
            }
        ];
        setPrompt(messageData);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    <p key={index}><strong>{msg.role}:</strong> <pre>{JSON.stringify(msg.content)}</pre></p>
                ))}
            </div>
            {image && <img src={image} alt="Uploaded" />}
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <p>Enter the birthdate:</p>
            <input value={input} onChange={(e) => setInput(e.target.value)} />
            <button onClick={handleSend}>Send</button>
        </div>
    );
};

export default ChatComponent;
