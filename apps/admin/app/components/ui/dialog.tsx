'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/50"
                onClick={() => onOpenChange?.(false)}
            />
            <div className="relative z-50">
                {children}
            </div>
        </div>
    );
};

export const DialogContent: React.FC<DialogContentProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-white rounded-lg shadow-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto ${className}`}>
            {children}
        </div>
    );
};

export const DialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <div className="mb-4">{children}</div>;
};

export const DialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <h2 className="text-2xl font-semibold">{children}</h2>;
};

export const DialogDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <p className="text-sm text-gray-600 mt-1">{children}</p>;
};

export const DialogFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <div className="mt-6 flex justify-end gap-2">{children}</div>;
};

export const DialogClose: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
        >
            <X className="h-4 w-4" />
        </Button>
    );
};

