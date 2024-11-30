interface TitleProps {
	title: string;
	description: string;
}

const ButtonPrimary: React.FC<TitleProps> = ({title, description}) => {
	return (
		<div className="flex flex-col justify-center items-center p-3">
			<h3 className="text-xl font-semibold leading-6 tracking-tighter">{title}</h3>
			<p className="mt-1.5 text-sm font-medium">{description}</p>
		</div>
	)
}

export default ButtonPrimary;