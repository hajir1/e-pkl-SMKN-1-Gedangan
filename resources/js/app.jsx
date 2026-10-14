import "../css/app.css";
import "./bootstrap";
import "flowbite";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FlashMessages from "@/Components/FlashMessages";

const appName = import.meta.env.VITE_APP_NAME || "E-PKL";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data wilayah jarang berubah; tidak perlu diambil ulang tiap fokus.
            staleTime: 1000 * 60 * 60,
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx")
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <QueryClientProvider client={queryClient}>
                <App {...props} />
                <FlashMessages
                    initialFlash={props.initialPage?.props?.auth?.flash}
                />
            </QueryClientProvider>
        );
    },
    progress: {
        color: "#1d4ed8",
        showSpinner: false,
    },
});
