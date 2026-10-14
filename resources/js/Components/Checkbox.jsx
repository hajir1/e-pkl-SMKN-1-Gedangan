export default function Checkbox({ className = "", ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                "h-4 w-4 rounded border-slate-400 text-blue-700 shadow-sm focus:ring-2 focus:ring-blue-500 " +
                className
            }
        />
    );
}
