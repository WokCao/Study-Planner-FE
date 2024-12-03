import { OverridableTokenClientConfig } from "@react-oauth/google";

interface LinkProps {
	label: string;
	googleHandler: (overrideConfig?: OverridableTokenClientConfig) => void
}

const ButtonLink: React.FC<LinkProps> = ({ label, googleHandler }) => {
	const handleClick = () => {
		if (googleHandler) {
			googleHandler();
		}
	};
	return (
		<button className="border border-violet-900/50 rounded-xl w-full mb-3 py-1 text-sm font-medium flex items-center justify-center disabled:pointer-events-none disabled:opacity-50"
			onClick={handleClick}>{label}</button>
	)
}

export default ButtonLink;