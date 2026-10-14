import SideMenu, { handleLogout } from "@/Components/SideMenu";
import { assetUrl, inisial, roleLabel } from "@/Helpers/format";
import {
    Dialog,
    DialogPanel,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { Link, usePage } from "@inertiajs/react";
import { ChevronDown, LogOut, Menu as MenuIcon, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";

const Brand = () => (
    <Link
        href={route("dashboard")}
        className="flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
        <img
            src={assetUrl("img/logo.png")}
            alt=""
            className="h-9 w-9 rounded-xl bg-white object-contain p-1 ring-1 ring-slate-200"
        />
        <span className="leading-tight">
            <span className="block text-sm font-semibold text-slate-900">
                E-PKL
            </span>
            <span className="block text-xs text-slate-500">
                SMKN 1 Gedangan
            </span>
        </span>
    </Link>
);

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);

    // Tutup drawer saat layar menjadi lebar.
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        const handler = () => mq.matches && setMobileOpen(false);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <a
                href="#konten"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow"
            >
                Lewati ke konten
            </a>

            {/* Sidebar desktop */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
                <div className="flex h-16 shrink-0 items-center px-5">
                    <Brand />
                </div>
                <div className="flex-1 overflow-y-auto px-3 pb-6 pt-2">
                    <SideMenu />
                </div>
            </aside>

            {/* Drawer mobile */}
            <Transition show={mobileOpen}>
                <Dialog
                    className="relative z-50 lg:hidden"
                    onClose={setMobileOpen}
                >
                    <TransitionChild
                        enter="transition-opacity duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-slate-900/50" />
                    </TransitionChild>
                    <div className="fixed inset-0 flex">
                        <TransitionChild
                            enter="transition duration-200 ease-out"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition duration-150 ease-in"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <DialogPanel className="relative flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
                                <div className="flex h-16 items-center justify-between px-5">
                                    <Brand />
                                    <button
                                        type="button"
                                        onClick={() => setMobileOpen(false)}
                                        aria-label="Tutup menu"
                                        className="-me-2 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto px-3 pb-6 pt-2">
                                    <SideMenu
                                        onNavigate={() => setMobileOpen(false)}
                                    />
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </Transition>

            <div className="lg:pl-64">
                {/* Topbar */}
                <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Buka menu"
                        className="-ms-1 inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
                    >
                        <MenuIcon className="h-5 w-5" />
                    </button>
                    <div className="min-w-0 flex-1">
                        {header ?? (
                            <p className="truncate text-sm text-slate-500 lg:hidden">
                                E-PKL SMKN 1 Gedangan
                            </p>
                        )}
                    </div>

                    <Menu as="div" className="relative">
                        <MenuButton className="flex items-center gap-2.5 rounded-xl p-1.5 text-left transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-sm font-semibold text-white">
                                {inisial(auth.user?.name)}
                            </span>
                            <span className="hidden max-w-[180px] leading-tight sm:block">
                                <span className="block truncate text-sm font-medium text-slate-900">
                                    {auth.user?.name}
                                </span>
                                <span className="block truncate text-xs text-slate-500">
                                    {roleLabel(auth.role)}
                                </span>
                            </span>
                            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
                        </MenuButton>
                        <MenuItems
                            anchor="bottom end"
                            className="z-40 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg focus:outline-none"
                        >
                            <div className="px-3 py-2 sm:hidden">
                                <p className="truncate text-sm font-medium text-slate-900">
                                    {auth.user?.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {roleLabel(auth.role)}
                                </p>
                            </div>
                            <MenuItem>
                                <Link
                                    href={route("profile.edit")}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 data-[focus]:bg-slate-100"
                                >
                                    <UserRound className="h-4 w-4 text-slate-400" />
                                    Profil Saya
                                </Link>
                            </MenuItem>
                            <MenuItem>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 data-[focus]:bg-rose-50"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Keluar
                                </button>
                            </MenuItem>
                        </MenuItems>
                    </Menu>
                </header>

                <main
                    id="konten"
                    className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
