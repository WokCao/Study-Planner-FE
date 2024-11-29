interface AnchorProps {
  label: string;
  href: string;
}

const Anchor: React.FC<AnchorProps> = ({label, href}) => {
	return (
		<a className="border border-violet-900/50 rounded-xl w-full mb-3 py-1 text-sm font-medium flex items-center justify-center disabled:pointer-events-none disabled:opacity-50"
			href={href}>{label}</a>
	)
}

export default Anchor;