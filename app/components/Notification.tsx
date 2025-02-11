'use client'

import {
    createContext,
    useContext,
    useState,
    ReactNode
} from 'react'

// NOTE - Type creation
type NotificationType = 'success' | 'error' | 'warning' | 'info';

// NOTE - Interface creation
interface NotificationContextType {
    showNotification: (
        message: string,
        type: NotificationType
    ) => void;
}


// NOTE - Context creation
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);


// NOTE - Provider creation
export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notification, setNotification] = useState<{
        message: string;
        type: NotificationType;
        id: number;
    } | null>(null);


    // NOTE - Function creation
    const showNotification = function (
        message: string,
        type: NotificationType
    ) {
        const id = Date.now();
        setNotification({ message, type, id });
        setTimeout(() => {
            setNotification((current) => (
                current?.id === id ? null : current
            ));
        }, 3000);
    }


    return (
        <NotificationContext.Provider
            value={{ showNotification }}
        >
            {children}

            {notification && (
                <div
                    className='toast toast-bottom toast-end z-[100]'
                >
                    <div
                        className={`alert ${getAlertClass(notification.type)}`}
                    >
                        <span>{notification.message}</span>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    )
}


// NOTE - Function creation
function getAlertClass(type: NotificationType): string {
    switch (type) {
        case 'success':
            return 'alert-success';
        case 'error':
            return 'alert-error';
        case 'warning':
            return 'alert-warning';
        case 'info':
            return 'alert-info';
        default:
            return 'alert-info';
    }
}



// NOTE - Hook creation
export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}