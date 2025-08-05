
import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { AppContext } from '../contexts/AppContext';
import { generateTopicContent, getChatResponse } from '../services/geminiService';
import type { Topic, ChatMessage } from '../types';
import Icon from './Icon';
import Spinner from './Spinner';
import QuizModal from './QuizModal';
import TaskModal from './TaskModal';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({html: true, linkify: true, typographer: true});

const LearningView: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return <Spinner text="Loading context..." />;
    const { activeCourse, updateCourse, goToDashboard } = context;

    const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
    const [isContentLoading, setIsContentLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState<'quiz' | 'task' | null>(null);
    
    useEffect(() => {
        if (activeCourse) {
            let lastCompletedIndex = -1;
            for (let i = activeCourse.topics.length - 1; i >= 0; i--) {
                if (activeCourse.topics[i].status === 'completed') {
                    lastCompletedIndex = i;
                    break;
                }
            }
            const firstUnlockedIndex = (lastCompletedIndex === -1) ? 0 : lastCompletedIndex + 1;
            const topicToSelect = activeCourse.topics[firstUnlockedIndex] || activeCourse.topics[0];
            if(topicToSelect) {
                setSelectedTopicId(topicToSelect.id);
            }
        }
    }, [activeCourse]);

    const selectedTopic = useMemo(() => {
        return activeCourse?.topics.find(t => t.id === selectedTopicId) || null;
    }, [activeCourse, selectedTopicId]);

    const handleSelectTopic = useCallback(async (topic: Topic) => {
        if (topic.status === 'locked' || !activeCourse) return;
        setSelectedTopicId(topic.id);
        if (!topic.content) {
            setIsContentLoading(true);
            try {
                const { content, references } = await generateTopicContent(topic.title, activeCourse.subject);
                const updatedTopics = activeCourse.topics.map(t =>
                    t.id === topic.id ? { ...t, content, references } : t
                );
                updateCourse({ ...activeCourse, topics: updatedTopics });
            } catch (error) {
                console.error("Failed to load topic content:", error);
            } finally {
                setIsContentLoading(false);
            }
        }
    }, [activeCourse, updateCourse]);

    useEffect(() => {
        if (selectedTopic && selectedTopic.status !== 'locked' && !selectedTopic.content) {
            handleSelectTopic(selectedTopic);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTopic, handleSelectTopic]);
    
    const completeTopic = (topicId: string) => {
        if (!activeCourse) return;
        const topicIndex = activeCourse.topics.findIndex(t => t.id === topicId);
        const updatedTopics = [...activeCourse.topics];
        updatedTopics[topicIndex].status = 'completed';

        if (topicIndex + 1 < updatedTopics.length) {
            updatedTopics[topicIndex + 1].status = 'unlocked';
            setSelectedTopicId(updatedTopics[topicIndex + 1].id);
        }
        
        updateCourse({ ...activeCourse, topics: updatedTopics });
        setIsModalOpen(null);
    };

    if (!activeCourse) {
        return <div className="p-8">Course not found. <button onClick={goToDashboard}>Go to Dashboard</button></div>;
    }

    return (
        <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Sidebar */}
            <aside className="w-80 bg-gray-900 text-white flex flex-col shadow-2xl">
                <div className="p-5 border-b border-gray-700 flex items-center gap-3">
                    <button onClick={goToDashboard} className="p-1 rounded-full hover:bg-gray-700"><Icon name="back" className="w-5 h-5"/></button>
                    <h2 className="text-xl font-bold truncate">{activeCourse.subject}</h2>
                </div>
                <nav className="flex-grow overflow-y-auto">
                    <ul>
                        {activeCourse.topics.map(topic => (
                            <li key={topic.id}>
                                <button
                                    onClick={() => handleSelectTopic(topic)}
                                    disabled={topic.status === 'locked'}
                                    className={`w-full text-left p-4 pr-6 flex items-center gap-4 transition-colors duration-200 ${
                                        selectedTopicId === topic.id ? 'bg-blue-600' : 'hover:bg-gray-700/50'
                                    } ${topic.status === 'locked' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex-shrink-0">
                                        {topic.status === 'completed' ? <Icon name="check" className="w-5 h-5 text-green-400" /> :
                                         topic.type === 'lesson' ? <Icon name="book" className="w-5 h-5 text-gray-400" /> :
                                         <Icon name="target" className="w-5 h-5 text-gray-400" />}
                                    </div>
                                    <span className="flex-grow">{topic.title}</span>
                                    {topic.status !== 'locked' && <Icon name="chevron-right" className="w-4 h-4" />}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {selectedTopic ? (
                    <div className="flex flex-col h-full">
                       <div className="flex-grow overflow-y-auto p-8 lg:p-12">
                            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-4">{selectedTopic.title}</h1>
                            {isContentLoading ? (
                                <div className="mt-16 flex justify-center"><Spinner size="lg" text="Loading lesson..."/></div>
                            ) : (
                                <>
                                    <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: md.render(selectedTopic.content || '') }}></div>
                                    {selectedTopic.references && selectedTopic.references.length > 0 && (
                                        <div className="mt-12 pt-6 border-t dark:border-gray-700">
                                            <h3 className="text-xl font-semibold mb-3">Further Reading</h3>
                                            <ul className="list-disc list-inside space-y-2">
                                                {selectedTopic.references.map((ref, i) => (
                                                    <li key={i}><a href={ref} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{ref}</a></li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {selectedTopic.status !== 'completed' && selectedTopic.content && (
                                        <div className="mt-12 text-center">
                                            <button 
                                                onClick={() => setIsModalOpen(selectedTopic.type === 'lesson' ? 'quiz' : 'task')}
                                                className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transform hover:scale-105 transition">
                                                {selectedTopic.type === 'lesson' ? 'Ready for a Quiz?' : 'Start Checkpoint'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                       </div>
                       {selectedTopic.content && !isContentLoading && <ChatInterface topic={selectedTopic} />}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Select a topic to begin learning.</p>
                    </div>
                )}
            </main>
            
            {isModalOpen === 'quiz' && selectedTopic && (
                <QuizModal 
                    topic={selectedTopic}
                    onClose={() => setIsModalOpen(null)}
                    onComplete={() => completeTopic(selectedTopic.id)}
                />
            )}
            {isModalOpen === 'task' && selectedTopic && (
                 <TaskModal 
                    topic={selectedTopic}
                    subject={activeCourse.subject}
                    onClose={() => setIsModalOpen(null)}
                    onComplete={() => completeTopic(selectedTopic.id)}
                 />
            )}
        </div>
    );
};


const ChatInterface: React.FC<{topic: Topic}> = ({ topic }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!input.trim()) return;

        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        try {
            const response = await getChatResponse(topic.content || '', newMessages, input);
            setMessages(prev => [...prev, {role: 'model', content: response}]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {role: 'model', content: "Sorry, I couldn't process that. Please try again."}]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
             <div className="max-h-48 overflow-y-auto mb-2 space-y-2 px-2">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                         {msg.role === 'model' && <span className="p-2 bg-blue-500 text-white rounded-full text-sm"><Icon name="robot" className="w-4 h-4"/></span>}
                         <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                             <p className="text-sm">{msg.content}</p>
                         </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex items-start gap-2.5">
                        <span className="p-2 bg-blue-500 text-white rounded-full text-sm"><Icon name="robot" className="w-4 h-4"/></span>
                        <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                             <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
             </div>
             <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={`Ask about ${topic.title}...`}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <button type="submit" disabled={isTyping} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-400">
                    <Icon name="send" className="w-5 h-5"/>
                </button>
            </form>
        </div>
    );
};

export default LearningView;