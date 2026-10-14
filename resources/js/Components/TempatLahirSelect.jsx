import { useGetProvince, useGetRegencies } from "@/services/api_call";
import { useState } from "react";
import FormField from "./FormField";
import Select from "./Select";
import TextInput from "./TextInput";

/**
 * Pilihan tempat lahir (provinsi -> kabupaten/kota) dari API wilayah.
 * Bila API wilayah gagal dimuat, pengguna tetap bisa mengetik manual
 * (sebelumnya dropdown kosong dan form tidak bisa dikirim).
 */
export default function TempatLahirSelect({
    value,
    onChange,
    error,
    required = true,
    defaultProvince = "35",
    labelClassName = "",
}) {
    const [provinceId, setProvinceId] = useState(defaultProvince);
    const provinces = useGetProvince();
    const regencies = useGetRegencies(provinceId);
    const gagal = provinces.isError || regencies.isError;

    if (gagal) {
        return (
            <FormField
                label="Tempat lahir"
                htmlFor="tempat_lahir"
                required={required}
                error={error}
                help="Data wilayah tidak dapat dimuat, silakan ketik nama kota/kabupaten."
            >
                <TextInput
                    id="tempat_lahir"
                    className="w-full"
                    value={value ?? ""}
                    invalid={!!error}
                    onChange={(e) => onChange(e.target.value)}
                />
            </FormField>
        );
    }

    // Nilai lama yang tidak ada di daftar tetap ditampilkan sebagai opsi.
    const daftar = regencies.data ?? [];
    const adaDiDaftar = daftar.some((r) => r.name === value);

    return (
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${labelClassName}`}>
            <FormField label="Provinsi lahir" htmlFor="provinsi_lahir">
                <Select
                    id="provinsi_lahir"
                    value={provinceId}
                    disabled={provinces.isLoading}
                    onChange={(e) => {
                        setProvinceId(e.target.value);
                        onChange("");
                    }}
                >
                    {provinces.isLoading && <option>Memuat provinsi...</option>}
                    {(provinces.data ?? []).map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </Select>
            </FormField>
            <FormField
                label="Kota/Kabupaten lahir"
                htmlFor="tempat_lahir"
                required={required}
                error={error}
            >
                <Select
                    id="tempat_lahir"
                    value={value ?? ""}
                    invalid={!!error}
                    disabled={regencies.isLoading}
                    onChange={(e) => onChange(e.target.value)}
                >
                    <option value="">
                        {regencies.isLoading ? "Memuat data..." : "Pilih kota/kabupaten"}
                    </option>
                    {value && !adaDiDaftar && <option value={value}>{value}</option>}
                    {daftar.map((r) => (
                        <option key={r.id} value={r.name}>
                            {r.name}
                        </option>
                    ))}
                </Select>
            </FormField>
        </div>
    );
}
