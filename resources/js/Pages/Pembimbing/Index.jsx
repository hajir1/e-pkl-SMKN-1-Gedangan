import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TitlePage from "@/Components/TitlePage";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Edit, Plus, Trash, X } from "lucide-react";
import Pagination from "@/Components/Pagination";
import Swal from "sweetalert2";
import { Alert, AlertConfirm } from "@/Helpers/Alert";
import Filter from "@/Components/Filter";
import Modal from "@/Components/Modal";
import TitleModal from "@/Components/TitleModal";
import InputLabel from "@/Components/InputLabel";
import Table from "@/Components/Table";
import { OptionSorting } from "@/Components/Option";
import { toast, ToastContainer } from "react-toastify";
const Index = () => {
    const { pembimbings, filters, jurusans, tahunAjarans } = usePage().props;
    const [sortModal, setSortModal] = useState(false);
    const { data: dataSearch, setData: setDataSearch } = useForm({
        search: filters?.search ?? "",
        sort_by: filters?.sort_by ?? "",
        sort_order: filters?.sort_order ?? "",
        tahunAjaran: filters?.tahunAjaran ?? "",
        jurusan: filters?.jurusan ?? "",
    });
    const handleDelete = (e, id, nama) => {
        e.preventDefault();
        const text = `Apakah Anda Yakin Ingin Menghapus User ${nama}`;
        const cb = () =>
            router.delete(route("pembimbing.destroy", id), {
                onSuccess: (sccs) => {
                    toast.success(`${sccs.props.auth.flash?.success}`);
                },
            });
        AlertConfirm(text, "warning", cb);
    };
    const handleSearchChange = (e) => {
        e.preventDefault();
        const { name, value } = e.target;
        const update = {
            ...dataSearch,
            [name]: value,
        };
        setDataSearch(update);
        const params = {};
        if (update.search !== "") params.search = update.search;
        if (update.sort_by !== "") params.sort_by = update.sort_by;
        if (update.sort_by !== "" && update.sort_order !== "")
            params.sort_order = update.sort_order;
        if (update.jurusan !== "") params.jurusan = update.jurusan;
        if (update.tahunAjaran !== "") params.tahunAjaran = update.tahunAjaran;

        router.get(route("pembimbing.index"), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };
    return (
        <AuthenticatedLayout>
            <Head title="Pembimbing" />
            <ToastContainer className={`w-96`} />

            <TitlePage
                nameRoute={"Tambah Pembimbing"}
                quote={
                    "list pembimbing sistem rekap kegiatan pkl secara digital"
                }
                title={"Pembimbing"}
                onClick={() =>
                    (window.location.href = route("pembimbing.create"))
                }
            ></TitlePage>
            <Filter
                sortModal={sortModal}
                value={dataSearch.search}
                onChange={handleSearchChange}
                setSortModal={setSortModal}
            />
            <div className="p-2">
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <Table
                        headers={[
                            { nama: "#" },
                            { nama: "Nama" },
                            { nama: "Email" },
                            { nama: "Kontak" },
                            { nama: "Jurusan" },
                            { nama: "Tahun Ajaran" },
                            { nama: "Role" },
                            { nama: "Opsi" },
                        ]}
                    >
                        <tbody>
                            {pembimbings?.data.length > 0 ? (
                                pembimbings?.data.map((pb, index) => (
                                    <tr
                                        key={index}
                                        className="bg-white border-b  border-gray-200"
                                    >
                                        <td className="px-4 text-center py-4">
                                            {index + pembimbings?.from}
                                        </td>

                                        <td className="px-4 text-center py-4">
                                            {pb.name}
                                        </td>
                                        <td className="px-4 text-center py-4">
                                            {pb.email}
                                        </td>
                                        <td className="px-4 text-center py-4">
                                            {pb.kontak === ""
                                                ? "Belum Diisi"
                                                : pb.kontak}
                                        </td>
                                        <td className="px-4 text-center py-4">
                                            {pb.jurusan?.nama
                                                ? pb.jurusan?.nama
                                                : "Belum Diisi"}
                                        </td>
                                        <td className="px-4 text-center py-4">
                                            {pb.tahun_ajaran?.tahun
                                                ? pb.tahun_ajaran?.tahun
                                                : "Belum Diisi"}
                                        </td>
                                        <td className="px-4 text-center py-4">
                                            {pb.roles[0]?.name ===
                                            "pembimbing_sekolah"
                                                ? pb.roles[0]?.name?.replace(
                                                      /_/g,
                                                      " "
                                                  )
                                                : `${pb.roles[0]?.name?.replace(
                                                      /_/g,
                                                      " "
                                                  )}- ${
                                                      pb.tempat_yang_dibimbing
                                                          ?.nama ??
                                                      "Belum diisi"
                                                  }`}
                                        </td>

                                        <td className="px-4 text-center py-4 ">
                                            <div className="flex justify-center gap-2">
                                                <div
                                                    onClick={(e) =>
                                                        (window.location.href =
                                                            route(
                                                                "pembimbing.edit",
                                                                pb.id
                                                            ))
                                                    }
                                                    className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
                                                >
                                                    <Edit />
                                                </div>
                                                <div
                                                    onClick={(e) =>
                                                        handleDelete(
                                                            e,
                                                            pb.id,
                                                            pb.name
                                                        )
                                                    }
                                                    className="font-medium text-red-800 hover:text-red-700 transition-all cursor-pointer"
                                                >
                                                    <Trash />
                                                </div>
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
                                        Tidak ada Pembimbing Di tambahkan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
                {pembimbings?.data.length > 0 && (
                    <Pagination datas={pembimbings}></Pagination>
                )}
            </div>
            <Modal show={sortModal} onClose={() => setSortModal(!sortModal)}>
                <div className="relative bg-white rounded-lg shadow-sm ">
                    <TitleModal
                        icon={<X />}
                        title={"Filter Dan Sorting Pembimbing"}
                        onClick={() => {
                            setSortModal(!sortModal);
                        }}
                    ></TitleModal>
                    <OptionSorting
                        dataSearch={dataSearch}
                        handleSearchChange={handleSearchChange}
                        datas={[
                            { name: "Default", value: "" },
                            { name: "Nama", value: "name" },
                            { name: "Email", value: "email" },
                            { name: "Ho Hp", value: "kontak" },
                            { name: "Jurusan", value: "jurusan_id" },
                            { name: "Tahun Ajaran", value: "tahunAjaran_id" },
                        ]}
                    />
                    <div className="p-4 md:p-5">
                        <h3 className="text-lg font-semibold text-gray-900 ">
                            Filter Data Pembimbing
                        </h3>
                        <div className="grid gap-4 grid-cols-1">
                            <div className="">
                                <InputLabel value={"Tahun Ajaran"} />
                                <select
                                    onChange={(e) => handleSearchChange(e)}
                                    value={dataSearch.tahunAjaran}
                                    id="tahunAjaran"
                                    name="tahunAjaran"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-stone-500 focus:border-stone-500 block w-full p-2.5 "
                                >
                                    <option value="">Default</option>
                                    {tahunAjarans.length > 0 &&
                                        tahunAjarans.map((ta) => (
                                            <option key={ta.id} value={ta.id}>
                                                {ta.tahun}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div className="">
                                <InputLabel value={"Jurusan"} />
                                <select
                                    onChange={(e) => handleSearchChange(e)}
                                    value={dataSearch.jurusan}
                                    id="jurusan"
                                    name="jurusan"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-stone-500 focus:border-stone-500 block w-full p-2.5 "
                                >
                                    <option value="">Default</option>
                                    {jurusans.length > 0 &&
                                        jurusans.map((jurusan) => (
                                            <option
                                                key={jurusan.id}
                                                value={jurusan.id}
                                            >
                                                {jurusan.nama}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
};

export default Index;
