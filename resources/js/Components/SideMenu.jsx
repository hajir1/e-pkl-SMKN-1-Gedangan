import { AlertConfirm } from "@/Helpers/Alert";
import { Link, router, usePage } from "@inertiajs/react";
import {
    Book,
    BookCopy,
    Calendar,
    Castle,
    Check,
    CheckCircle2,
    Edit,
    FileSliders,
    GpuIcon,
    IdCard,
    Image,
    LayoutIcon,
    ListStartIcon,
    LogOut,
    Newspaper,
    Trash,
    User,
    UserPen,
    Users,
} from "lucide-react";

const SideMenu = ({ children, ...props }) => {
    const { auth, ptCount, lpCount, trashJurnalCount } = usePage().props;
    const routes = [
        {
            id: 1,
            nama: "Dashbaord",
            pathname: "dashboard",
            route: route("dashboard"),
            icon: <LayoutIcon />,
            isLink: true,
            rolePermision: [
                "admin",
                "pembimbing_sekolah",
                "pembimbing_pt",
                "siswa",
            ],
        },

        {
            id: 2,
            nama: "User Terdata",
            pathname: "data_siswa",
            route: route("data_siswa.index"),
            icon: <IdCard />,
            rolePermision: ["admin"],
            isLink: true,
        },
        {
            id: 1200,
            nama: "Laporan",
            pathname:
                window.location.pathname.split("/", 3)[1] === "laporan"
                    ? window.location.pathname.replace("/", "")
                    : "",
            route:
                auth.role === "siswa"
                    ? route("laporan.create")
                    : route("laporan.index"),
            icon: <Newspaper />,
            rolePermision: [
                "siswa",
                "admin",
                "pembimbing_pt",
                "pembimbing_sekolah",
            ],
            isLink: true,
            isAlert: true,
            alert: auth.role === "admin" ? lpCount : 0,
        },
        {
            id: 3,
            nama: auth.role === "admin" ? "Ajuan Tempat" : "Ajukan Tempat",
            pathname:
                window.location.pathname.split("/", 3)[1] === "pengajuanTempat"
                    ? window.location.pathname.replace("/", "")
                    : "",
            route:
                auth.role === "admin"
                    ? route("pengajuanTempat.index")
                    : route("pengajuanTempat.create"),
            icon: <CheckCircle2 />,
            rolePermision: ["siswa", "admin"],
            isLink: true,
            isAlert: true,
            alert: auth.role === "admin" ? ptCount : 0,
        },
        {
            id: 4,
            nama: "Slider",
            pathname: "gambar",
            route: route("gambar.index"),
            icon: <Image />,
            rolePermision: ["admin"],
            isLink: true,
        },
        {
            id: 5,
            nama: "Jurusan",
            pathname: "jurusan",
            route: route("jurusan.index"),
            icon: <Book />,
            rolePermision: ["admin"],
            isLink: true,
        },
        {
            id: 6,
            nama: "Tahun Ajaran",
            pathname: "tahunAjaran",
            route: route("tahunAjaran.index"),
            icon: <Calendar />,
            rolePermision: ["admin"],
            isLink: true,
        },
        {
            id: 7,
            nama: "Tempat Du/Di",
            pathname: "tempat",
            route: route("tempat.index"),
            icon: <Castle />,
            rolePermision: ["admin"],
            isLink: true,
        },
        {
            id: 8,
            nama: "Pembimbing",
            pathname:
                window.location.pathname.split("/", 3)[1] === "pembimbing"
                    ? window.location.pathname.replace("/", "")
                    : "",
            route: route("pembimbing.index"),
            icon: <UserPen />,
            rolePermision: ["admin"],
            isLink: true,
        },
        {
            id: 9,
            nama: "Siswa",
            pathname:
                window.location.pathname.split("/", 3)[1] === "siswa"
                    ? window.location.pathname.replace("/", "")
                    : "",
            route: route("siswa.index"),
            icon: <User />,
            rolePermision: [
                "admin",
                "pembimbing_pt",
                "pembimbing_sekolah",
                "siswa",
            ],
            isLink: true,
        },
        {
            id: 10,
            nama: "Jurnal",
            pathname: "jurnal",
            route: route("jurnal.index"),
            icon: <BookCopy />,
            isLink: true,
            rolePermision: [
                "siswa",
                "admin",
                "pembimbing_pt",
                "pembimbing_sekolah",
            ],
        },
        {
            id: 13,
            nama: "Trash",
            pathname: "trashJurnal",
            route: route("trashJurnal.index"),
            icon: <Trash />,
            isLink: true,
            rolePermision: ["siswa"],
            isAlert: true,
            alert: auth.role === "siswa" ? trashJurnalCount : 0,
        },
        {
            id: 11,
            nama: "Edit Akun",
            pathname: "profile",
            route: route("profile.edit"),
            icon: <Edit />,
            isLink: true,
            rolePermision: [
                "siswa",
                "pembimbing_pt",
                "pembimbing_sekolah",
                "admin",
            ],
        },

        {
            id: 12,
            nama: "Dokumentasi",
            pathname: "dokumentasi",
            route: route("dokumentasi"),
            icon: <FileSliders />,
            isLink: true,
            rolePermision: [
                "siswa",
                "pembimbing_pt",
                "pembimbing_sekolah",
                "admin",
            ],
        },

        {
            id: 14,
            nama: "Logout",
            icon: <LogOut />,
            isLink: false,
        },
    ];
    const handleLogout = (e) => {
        e.preventDefault();
        AlertConfirm(
            "Anda Akan Logout!",
            "question",
            () => {
                router.post(route("logout"));
            },
            "Ya , Logout"
        );
    };
    return (
        <>
            {routes.map((route) => (
                <li key={route.id}>
                    {route.isLink ? (
                        route.rolePermision?.includes(auth?.role) && (
                            <Link
                                as="button"
                                href={route.route}
                                className={`${
                                    window.location.pathname.replace(
                                        "/",
                                        ""
                                    ) === route.pathname
                                        ? "bg-blue-700 text-white hover:bg-blue-600"
                                        : "text-gray-900 hover:bg-stone-300"
                                } w-full flex items-center p-2 rounded-lg   group`}
                            >
                                <span className="">{route.icon}</span>
                                <span className="ms-1 sm:ms-3 text-xs md:text-base sm:block">
                                    {route.nama}
                                </span>
                                {route.isAlert && route.alert !== 0 && (
                                    <span className="rounded-full w-6 h-6 ms-0 sm:ms-3  bg-red-700 text-white animate-pulse">
                                        {route.alert}
                                    </span>
                                )}
                            </Link>
                        )
                    ) : (
                        <div
                            onClick={(e) => handleLogout(e)}
                            className="flex items-center p-2 text-gray-900 rounded-lg dark:text-slate-800 hover:bg-stone-300 group cursor-pointer"
                        >
                            <span className="">{route.icon}</span>
                            <span className="ms-1 sm:ms-3 text-xs md:text-base sm:block">
                                {route.nama}
                            </span>
                        </div>
                    )}
                </li>
            ))}
        </>
    );
};

export default SideMenu;
