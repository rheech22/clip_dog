import { cn } from "../utils";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = ({ className, ...props }: Props) => {
  return (
    <button
      className={cn(
        "text-white px-2 py-4 text-2xl rounded-md bg-zinc-300/10 hover:bg-zinc-300/40 transition-colors duration-300",
        className,
      )}
      {...props}
    />
  );
};

export default Button;
