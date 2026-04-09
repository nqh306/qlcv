import { useState, Fragment } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@plane/propel/button";
import { Dialog, Transition } from "@headlessui/react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  password: string;
  email: string;
};

export const TempPasswordModal = ({ isOpen, onClose, password, email }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-backdrop transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-20 overflow-y-auto">
          <div className="my-10 flex justify-center p-4 text-center sm:p-0 md:my-20">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative w-full transform rounded-lg bg-surface-1 p-5 px-4 text-left shadow-raised-200 transition-all sm:max-w-md">
                <h3 className="text-16 leading-6 font-medium text-primary">Temporary Password</h3>
                <div className="mt-4 space-y-3">
                  <p className="text-body-sm-regular text-secondary">
                    Account created for <span className="font-medium text-primary">{email}</span>. Share this temporary
                    password with the user. They will be required to change it on first login.
                  </p>
                  <div className="flex items-center gap-2 rounded-md border border-subtle bg-surface-2 p-3">
                    <code className="flex-1 font-mono text-body-sm-medium text-primary">{password}</code>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 rounded px-2 py-1 text-caption-md-medium text-secondary hover:bg-surface-3"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button variant="primary" size="base" onClick={onClose}>
                    Done
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
