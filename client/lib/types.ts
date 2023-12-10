// components/ui
export interface LabelProps {
  className?: string;
  htmlFor: string;
  children?: React.ReactNode;
}

export interface InputProps {
  className?: string;
  id?: string;
  placeholder?: string;
  type?: string;
  name?: string;
  value?: any;
  onKeyDown?: (event: React.KeyboardEvent<any>) => any
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface FormData {
  username: string;
  groupID: string;
}
