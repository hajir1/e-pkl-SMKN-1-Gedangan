import Card, { CardBody, CardHeader } from "@/Components/Card";
import TitlePage from "@/Components/TitlePage";
import { inisial, roleLabel } from "@/Helpers/format";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import { KeyRound, ShieldAlert, UserRound } from "lucide-react";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    return (
        <AuthenticatedLayout>
            <Head title="Profil Saya" />
            <div className="space-y-6">
                <TitlePage eyebrow="Akun" title="Profil Saya" quote="Kelola informasi akun dan keamanan login Anda." />

                <Card>
                    <CardBody className="flex items-center gap-4">
                        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-lg font-semibold text-white">{inisial(auth.user.name)}</span>
                        <div className="min-w-0">
                            <p className="truncate text-lg font-semibold text-slate-900">{auth.user.name}</p>
                            <p className="truncate text-sm text-slate-500">
                                {roleLabel(auth.role)} · {auth.user.email}
                            </p>
                        </div>
                    </CardBody>
                </Card>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 [&>*]:min-w-0">
                    <Card>
                        <CardHeader icon={<UserRound />} title="Informasi akun" description="Perbarui nama dan alamat email akun Anda." />
                        <CardBody>
                            <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                        </CardBody>
                    </Card>
                    <Card>
                        <CardHeader icon={<KeyRound />} title="Ganti password" description="Gunakan password yang panjang dan sulit ditebak." />
                        <CardBody>
                            <UpdatePasswordForm />
                        </CardBody>
                    </Card>
                </div>

                <Card className="border-rose-200">
                    <CardHeader icon={<ShieldAlert />} title="Hapus akun" description="Setelah dihapus, semua data akun ini akan hilang permanen." />
                    <CardBody>
                        <DeleteUserForm />
                    </CardBody>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
