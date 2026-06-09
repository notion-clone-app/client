import { useTranslation, i18nInstance } from '@/shared/model/localization';
import { Button } from '@/shared/ui/kit/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/kit/dropdown-menu';
import { Globe } from 'lucide-react';

const languages = [
    { code: 'en', label: 'En' },
    { code: 'ru', label: 'Ru' },
] as const;

export function PickLanguageDropdown() {
    const { i18n } = useTranslation();
    const currentLang = i18n.resolvedLanguage || 'en';

    const handleLangChange = (langCode: string) => {
        i18nInstance.changeLanguage(langCode);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="secondary"
                >
                    <Globe className="size-4" />
                    <span className="uppercase text-xs">
                        {currentLang}
                    </span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLangChange(lang.code)}
                    >
                        {lang.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu >
    );
}
