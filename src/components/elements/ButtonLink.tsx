import { Link } from 'react-router-dom';

interface LinkProps {
  label: string;
  path: string;
}

const ButtonLink: React.FC<LinkProps> = ({label, path}) => {
	return (
		<Link className="border border-violet-900/50 rounded-xl w-full mb-3 py-1 text-sm font-medium flex items-center justify-center disabled:pointer-events-none disabled:opacity-50"
			to={path}>{label}</Link>
	)
}

export default ButtonLink;