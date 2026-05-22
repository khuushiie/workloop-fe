import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Save, FileText, Send, RefreshCw, Loader2 } from 'lucide-react';
import Button from '../../common/Button';
import { cn } from '../../../utils/cn';
import { useLazyGetTemplatesDropdownQuery } from '../../../store/apis/survey.api';

interface SurveyBuilderHeaderProps {
  /** Called when a template is selected from dropdown - receives templateId */
  onLoadTemplate: (templateId: string) => void;
  onSaveAsDraft: () => void;
  onSaveAsTemplate: () => void;
  onUpdateExistingTemplate?: () => void;
  onPublish: () => void;
  isSaving: boolean;
  isPublishing: boolean;
  sourceTemplateId?: string | null;
  isViewMode?: boolean;
  hideLoadTemplate?: boolean;
  isEditingTemplate?: boolean;
}

const SurveyBuilderHeader: React.FC<SurveyBuilderHeaderProps> = ({
  onLoadTemplate,
  onSaveAsDraft,
  onSaveAsTemplate,
  onUpdateExistingTemplate,
  onPublish,
  isSaving,
  isPublishing,
  sourceTemplateId,
  isViewMode = false,
  hideLoadTemplate = false,
  isEditingTemplate = false,
}) => {
  const isEditingExistingTemplate = Boolean(sourceTemplateId) || isEditingTemplate;
  const [saveDropdownOpen, setSaveDropdownOpen] = useState(false);
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
  const saveDropdownRef = useRef<HTMLDivElement>(null);
  const templateDropdownRef = useRef<HTMLDivElement>(null);

  const [fetchTemplates, { data: templates = [], isLoading: isLoadingTemplates }] = useLazyGetTemplatesDropdownQuery();

  useEffect(() => {
    if (templateDropdownOpen) {
      fetchTemplates();
    }
  }, [templateDropdownOpen, fetchTemplates]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        saveDropdownRef.current &&
        !saveDropdownRef.current.contains(event.target as Node)
      ) {
        setSaveDropdownOpen(false);
      }
      if (
        templateDropdownRef.current &&
        !templateDropdownRef.current.contains(event.target as Node)
      ) {
        setTemplateDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveOption = (action: 'draft' | 'newTemplate' | 'updateTemplate') => {
    setSaveDropdownOpen(false);
    switch (action) {
      case 'draft':
        onSaveAsDraft();
        break;
      case 'newTemplate':
        onSaveAsTemplate();
        break;
      case 'updateTemplate':
        onUpdateExistingTemplate?.();
        break;
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    setTemplateDropdownOpen(false);
    onLoadTemplate(templateId);
  };

  if (isViewMode) {
    return (
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-slate-500 italic">
              View-only mode - editing is disabled
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Button
                appearance="secondary"
                size="small"
                icon={<Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                disabled
                aria-label="Save survey (disabled in view mode)"
              >
                <span className="hidden sm:inline">Save</span>
              </Button>
              <Button
                appearance="primary"
                size="small"
                icon={<Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                disabled
                aria-label="Publish survey (disabled in view mode)"
              >
                <span className="hidden sm:inline">Publish</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          {!hideLoadTemplate ? (
            <div ref={templateDropdownRef} className="relative">
              <Button
                appearance="secondary"
                size="small"
                onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
                icon={<FileText className="w-4 h-4" />}
                className="!bg-white !border-slate-200 hover:!bg-slate-50"
              >
                <span className="text-slate-700">Load from Template</span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-slate-400 transition-transform ml-2',
                    templateDropdownOpen && 'rotate-180'
                  )}
                />
              </Button>

              {templateDropdownOpen && (
                <div className="absolute left-0 mt-1 w-64 bg-white rounded-lg shadow-soft border border-slate-200 py-1 z-50 max-h-64 overflow-y-auto">
                  {isLoadingTemplates ? (
                    <div className="flex items-center justify-center py-4 px-4">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400 mr-2" />
                      <span className="text-sm text-slate-500">Loading templates...</span>
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="py-4 px-4 text-center">
                      <FileText className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No templates available</p>
                    </div>
                  ) : (
                    templates.map((template) => (
                      <button
                        key={template._id}
                        type="button"
                        onClick={() => handleSelectTemplate(template._id)}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus:bg-slate-50 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{template.title}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-500">
              {isEditingExistingTemplate ? 'Editing Template' : 'Editing Draft'}
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div ref={saveDropdownRef} className="relative">
              <Button
                appearance="secondary"
                size="small"
                icon={<Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                onClick={() => setSaveDropdownOpen(!saveDropdownOpen)}
                disabled={isSaving || isPublishing}
                className="pr-2"
                aria-label="Save options"
                aria-expanded={saveDropdownOpen}
                aria-haspopup="menu"
              >
                <span className="hidden sm:inline">Save</span>
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 transition-transform',
                    saveDropdownOpen && 'rotate-180'
                  )}
                />
              </Button>

              {saveDropdownOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-soft border border-slate-200 py-1 z-50">
                  <Button
                    appearance="text"
                    size="small"
                    onClick={() => handleSaveOption('draft')}
                    icon={<FileText className="w-4 h-4 text-slate-400" />}
                    className="!w-full !justify-start !px-4 !py-2.5 !rounded-none hover:!bg-slate-50"
                  >
                    Save as Draft
                  </Button>

                  <Button
                    appearance="text"
                    size="small"
                    onClick={() => handleSaveOption('newTemplate')}
                    icon={<FileText className="w-4 h-4 text-slate-400" />}
                    className="!w-full !justify-start !px-4 !py-2.5 !rounded-none hover:!bg-slate-50"
                  >
                    {isEditingExistingTemplate ? 'Save as New Template' : 'Save as Template'}
                  </Button>

                  {isEditingExistingTemplate && (
                    <Button
                      appearance="text"
                      size="small"
                      onClick={() => handleSaveOption('updateTemplate')}
                      icon={<RefreshCw className="w-4 h-4 text-slate-400" />}
                      className="!w-full !justify-start !px-4 !py-2.5 !rounded-none hover:!bg-slate-50"
                    >
                      Update Existing Template
                    </Button>
                  )}
                </div>
              )}
            </div>

            <Button
              appearance="primary"
              size="small"
              icon={<Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              onClick={onPublish}
              loading={isPublishing}
              disabled={isSaving || isPublishing}
              aria-label="Publish survey"
            >
              <span className="hidden sm:inline">Publish</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyBuilderHeader;
