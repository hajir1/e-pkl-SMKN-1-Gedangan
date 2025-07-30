import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TitlePage from "@/Components/TitlePage";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import Pagination from "@/Components/Pagination";
import { Edit, Plus, Trash, X } from "lucide-react";
import { Alert, AlertConfirm, AlertConfirmTwoOption } from "@/Helpers/Alert";
import Table from "@/Components/Table";
import { toast, ToastContainer } from "react-toastify";
import { useEffect } from "react";
const Index = () => {
    const { laporans } = usePage().props;
    const handleDelete = (e, id, judul) => {
        e.preventDefault();
        const text = `Apakah Anda Yakin Ingin Menghapus Judul Laporan ${judul}`;
        const cb = () =>
            router.delete(route("laporan.destroy", id), {
                onSuccess: (sccs) => {
                    toast.success(`${sccs.props.auth.flash?.success}`);
                },
            });
        AlertConfirm(text, "question", cb);
    };

    const handleEdit = (e, id) => {
        e.preventDefault();
        AlertConfirmTwoOption(
            "Jika diterima, siswa akan menggunakan judul ini untuk laporan. Jika ditolak, siswa diminta untuk mengajukan revisi.",
            "question",
            (cb) => {
                if (cb.isConfirmed) {
                    router.put(
                        route("laporan.update", id),
                        {
                            status: "terima",
                        },
                        {
                            onSuccess: (sccs) => {
                                if (sccs.props.auth.flash?.success) {
                                    toast.success(
                                        `${sccs.props.auth.flash?.success}`
                                    );
                                } else {
                                    toast.error(
                                        `${sccs.props.auth.flash?.error}`
                                    );
                                }
                            },
                        }
                    );
                } else if (cb.isDenied) {
                    router.put(
                        route("laporan.update", id),
                        {
                            status: "tolak",
                        },
                        {
                            onSuccess: (sccs) => {
                                if (sccs.props.auth.flash?.success) {
                                    toast.success(
                                        `${sccs.props.auth.flash?.success}`
                                    );
                                } else {
                                    toast.error(
                                        `${sccs.props.auth.flash?.error}`
                                    );
                                }
                            },
                        }
                    );
                }
            },
            "Terima"
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Laporan" />
            <ToastContainer className={`w-96`} />

            <TitlePage
                quote={"list laporan sistem rekap kegiatan pkl secara digital"}
                title={"Laporan"}
            ></TitlePage>
            <div className="p-2">
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <Table
                        headers={[
                            { nama: "#" },
                            { nama: "Nama" },
                            { nama: "Judul" },
                            { nama: "Digunakan" },
                            { nama: "Opsi" },
                        ]}
                    >
                        <tbody>
                            {laporans.data.length > 0 ? (
                                laporans.data.map((lp, index) => (
                                    <tr
                                        key={index}
                                        className="bg-white border-b  border-gray-200"
                                    >
                                        <td className="px-4 text-center py-4">
                                            {index + laporans.from}
                                        </td>

                                        <td className="px-4 text-center py-4">
                                            {lp.user?.name}
                                        </td>
                                        <td className="px-4 text-center py-4">
                                            {lp.judul}
                                        </td>
                                        <td className="px-4 text-center py-4">
                                            <div
                                                className={`${
                                                    lp.status === "pending" &&
                                                    "bg-blue-200 text-blue-700 rounded-md outline-1 outline-blue-300 ring-2"
                                                } ${
                                                    lp.status === "terima" &&
                                                    "bg-green-200 text-green-700 rounded-md outline outline-1"
                                                } ${
                                                    lp.status === "tolak" &&
                                                    "bg-red-200 text-red-700 rounded-md outline-1 ring-2 ring-red-300 outline-red-600"
                                                } inline-block px-2 py-1`}
                                            >
                                                {lp.status}
                                            </div>
                                        </td>

                                        <td className="px-4 text-center py-4">
                                            <div className=" flex justify-center items-center gap-2">
                                                {lp.status !== "terima" && (
                                                    <div
                                                        onClick={(e) =>
                                                            handleEdit(e, lp.id)
                                                        }
                                                        className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
                                                    >
                                                        <Edit />
                                                    </div>
                                                )}

                                                {lp.status !==
                                                    "terima" && (
                                                    <div
                                                        onClick={(e) =>
                                                            handleDelete(
                                                                e,
                                                                lp.id,
                                                                lp.judul
                                                            )
                                                        }
                                                        className="font-medium text-red-800 hover:text-red-700 transition-all cursor-pointer"
                                                    >
                                                        <Trash />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        className="p-2 text-sm font-medium text-center"
                                        colSpan={3}
                                    >
                                        Tidak ada Judul Di tambahkan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
                {laporans.data.length > 0 && (
                    <Pagination datas={laporans}></Pagination>
                )}
            </div>
        </AuthenticatedLayout>
    );
};

export default Index;
