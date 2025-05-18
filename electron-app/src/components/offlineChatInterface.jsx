
// import React, { useState } from "react";
// import axios from "axios";

// const OfflineChat = () => {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

//   // You can set model here or make it dynamic if needed
//   const model = "codegemma:7b";

//   const handleSend = async () => {
//     if (!input.trim()) return;

//     const userMessage = { role: "user", content: input };
//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");
//     setIsLoading(true);

//     try {
//       const res = await axios.post("http://localhost:11434/api/generate", {
//         model: model,
//         prompt: input,
//         stream: false,
//       });

//       const botResponse = res.data.response || "🤖 No response from the local model.";
//       const botMessage = { role: "assistant", content: botResponse };
//       setMessages((prev) => [...prev, botMessage]);
//     } catch (err) {
//       console.error("Error hitting local model API:", err);
//       const statusCode = err.response?.status || "";
//       const errorMsg = { role: "assistant", content: `⚠️ Offline Bot Error: ${statusCode} ${err.message}` };
//       setMessages((prev) => [...prev, errorMsg]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="p-4 border rounded-md shadow-md">
//       <h2 className="text-xl font-bold text-orange-600 mb-4">🛠️ Offline Chat (WizardCoder)</h2>

//       <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
//         {messages.map((msg, idx) => (
//           <div
//             key={idx}
//             className={`p-2 rounded ${
//               msg.role === "user" ? "bg-gray-200 text-right" : "bg-orange-100"
//             }`}
//           >
//             <p>
//               <strong>{msg.role === "user" ? "You" : "Bot"}:</strong> {msg.content}
//             </p>
//           </div>
//         ))}
//       </div>

//       <div className="flex items-center gap-2">
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           className="flex-1 border px-3 py-2 rounded"
//           placeholder="Type your prompt..."
//         />
//         <button
//           onClick={handleSend}
//           disabled={isLoading}
//           className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
//         >
//           {isLoading ? "Thinking..." : "Send"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default OfflineChat;


import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './OfflineChatInterface.css';


const OfflineChatInterface = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:11434/api/generate", {
        model: "codegemma:7b",
        prompt: input,
        stream: false,
      });

      const botResponse = res.data.response || "🤖 No response from the local model.";
      const botMessage = { role: "assistant", content: botResponse };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Error hitting local model API:", err);
      const errorMsg = { role: "assistant", content: `⚠️ Offline Bot Error: ${err.message}` };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2 className="text-xl font-bold text-orange-600 mb-4"> Offline Code Assistant </h2>
      </div>

      <div className="messages-container space-y-3 max-h-[400px] overflow-y-auto mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${
              msg.role === "user" ? "bg-black-200 text-right text-black-900" : "bg-orange-100 text-black-900"
            }`}
          >
            {/* <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline ? (
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={match ? match[1] : 'javascript'}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {msg.content}
            </ReactMarkdown> */}
            <ReactMarkdown
  components={{
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline ? (
        <SyntaxHighlighter
          style={tomorrow}
          language={match ? match[1] : 'javascript'}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  }}
>
  {msg.content}
</ReactMarkdown>

          </div>
        ))}
      </div>

      <div className="input-container flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border px-3 py-2 rounded"
          placeholder="Type your prompt..."
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
        >
          {isLoading ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default OfflineChatInterface;
