"use client";

import { useEffect, useState } from "react";

interface Template {
    id: string;
    name: string;
    shippingInfo: string;
    returnInfo: string;
}

export default function TemplateLoader({ onSelect }: { onSelect: (s: string, r: string) => void }) {
    const [templates, setTemplates] = useState<Template[]>([]);

    useEffect(() => {
        fetch("/api/admin/delivery-templates")
            .then(res => res.json())
            .then(json => {
                setTemplates(json.data || []);
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const tId = e.target.value;
        if (!tId) return;
        const template = templates.find(t => t.id === tId);
        if (template) {
            if (confirm(`'${template.name}' 템플릿 내용을 불러오시겠습니까?\n기존 입력된 내용은 덮어씌워집니다.`)) {
                onSelect(template.shippingInfo, template.returnInfo);
            }
            // Reset select to default?
            e.target.value = "";
        }
    };

    return (
        <select
            onChange={handleChange}
            className="text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 border bg-gray-50 text-gray-600"
            defaultValue=""
        >
            <option value="" disabled>템플릿 불러오기...</option>
            {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
            ))}
        </select>
    );
}
