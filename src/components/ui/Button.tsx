interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

export default function Button({ children, onClick, className }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            className={'bg-white text-black px-8 py-4 mt-6 rounded-lg font-bold hover:scale-105 transition ${className}'}
        >
            {children}
        </button>
    )
}