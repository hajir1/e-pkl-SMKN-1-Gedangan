export default function InputError({ message, className = "", ...props }) {
    return message ? (
        <p
            {...props}
            role="alert"
            className={"mt-1.5 text-sm text-rose-600 " + className}
        >
            {message}
        </p>
    ) : null;
}
