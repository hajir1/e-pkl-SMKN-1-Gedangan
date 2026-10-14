/** Footer halaman depan: peta lokasi sekolah dan hak cipta. */
const Footer = ({ children }) => (
    <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-2">
            <div>
                <p className="font-semibold text-slate-900">SMK Negeri 1 Gedangan</p>
                <p className="mt-1 text-sm text-slate-600">Kabupaten Malang, Jawa Timur</p>
                <a href="https://smkn1gedangan-malang.sch.id/" target="_blank" rel="noopener" className="mt-3 inline-block text-sm font-medium text-blue-700 hover:underline">
                    smkn1gedangan-malang.sch.id
                </a>
            </div>
            <iframe
                title="Lokasi SMK Negeri 1 Gedangan"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3948.5893292145684!2d112.61662247356743!3d-8.243983582792838!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e78a756844f736f%3A0xee8e378530c977fc!2sSMK%20Negeri%201%20Gedangan!5e0!3m2!1sid!2sid!4v1749087043538!5m2!1sid!2sid"
                className="h-48 w-full rounded-xl border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            />
        </div>
        <p className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">© {new Date().getFullYear()} SMK Negeri 1 Gedangan. Hak cipta dilindungi.</p>
        {children}
    </footer>
);

export default Footer;
