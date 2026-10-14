import InputLabel from "./InputLabel";
import Select from "./Select";

export const OptionSorting = ({ datas, handleSearchChange, dataSearch }) => {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
                <InputLabel htmlFor="sort_by" value={"Urutkan berdasarkan"} />
                <Select
                    onChange={(e) => handleSearchChange(e)}
                    value={dataSearch.sort_by}
                    id="sort_by"
                    name="sort_by"
                >
                    {datas.map((data) => (
                        <option key={data.value} value={data.value}>
                            {data.name}
                        </option>
                    ))}
                </Select>
            </div>
            <div>
                <InputLabel htmlFor="sort_order" value={"Arah urutan"} />
                <Select
                    onChange={(e) => handleSearchChange(e)}
                    value={dataSearch.sort_order}
                    id="sort_order"
                    name="sort_order"
                    disabled={dataSearch.sort_by === ""}
                >
                    <option value="">Bawaan</option>
                    <option value="asc">Naik (A-Z / terlama)</option>
                    <option value="desc">Turun (Z-A / terbaru)</option>
                </Select>
            </div>
        </div>
    );
};
