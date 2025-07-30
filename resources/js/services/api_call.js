import { useQuery } from "@tanstack/react-query";
export const useGetProvince = () =>
    useQuery({
        queryKey: ["province"],
        queryFn: () =>
            fetch(
                "https://hajir1.github.io/api-wilayah-indonesia/api/provinces.json"
            ).then((res) => res.json()),
    });
export const useGetRegencies = (id) =>
    useQuery({
        queryKey: ["regencies", id],
        queryFn: () =>
            fetch(`https://hajir1.github.io/api-wilayah-indonesia/api/regencies/${id}.json
`).then((res) => res.json()),
    });
