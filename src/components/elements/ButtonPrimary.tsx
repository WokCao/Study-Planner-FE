import { OverridableTokenClientConfig } from "@react-oauth/google";

interface ButtonProps {
  label: string;
  type: "submit" | "reset" | "button" | undefined;
  handleGoogleLogin?: (overrideConfig?: OverridableTokenClientConfig) => void
}

const ButtonPrimary: React.FC<ButtonProps> = ({label, type, handleGoogleLogin}) => {
	const handleClick = () => {
		if (handleGoogleLogin) {
		  handleGoogleLogin();
		}
	  };
	  
	return (
		<button
			className="bg-gradient-to-r from-violet-800 to-violet-500 text-white rounded-xl mb-3 px-10 py-2 text-sm font-semibold inline-flex items-center justify-center disabled:pointer-events-none disabled:opacity-50"
			type={type} onClick={handleClick}>{label}</button>
	)
}

export default ButtonPrimary;