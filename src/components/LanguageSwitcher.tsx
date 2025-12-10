'use client';

import { usePathname, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageSwitcher() {
    const pathname = usePathname();
    const router = useRouter();

    const toggleLanguage = (locale: string) => {
        // With next-intl/navigation hooks, we just allow the router to handle the locale switch
        router.replace(pathname, { locale });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9">
                    <Globe className="w-4 h-4" />
                    <span className="sr-only">Switch Language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toggleLanguage('en')}>
                    🇺🇸 English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleLanguage('es')}>
                    🇪🇸 Español
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleLanguage('pt')}>
                    🇧🇷 Português
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleLanguage('fr')}>
                    🇫🇷 Français
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
