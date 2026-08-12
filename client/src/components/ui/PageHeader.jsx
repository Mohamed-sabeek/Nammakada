const PageHeader = ({ title, subtitle }) => {
    return (
        <div className="mb-8">
            <h1 className="text-3xl md:text-[34px] font-bold text-gray-900 mb-2">{title}</h1>
            {subtitle && (
                <p className="text-[15px] font-medium text-slate-500">
                    {subtitle}
                </p>
            )}
        </div>
    );
};

export default PageHeader;
