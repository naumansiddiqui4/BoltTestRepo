import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Sparkles, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApp } from '../../contexts/AppContext';
import { LearningStyle } from '../../types';
import Button from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

const preferencesSchema = z.object({
  autoTest: z.boolean(),
  testFrequency: z.enum(['low', 'medium', 'high']),
  explanationDepth: z.enum(['brief', 'detailed', 'comprehensive']),
});

type PreferencesForm = z.infer<typeof preferencesSchema>;

const learningStyles = [
  { type: 'relevant-resources', label: 'Relevant Resources', description: 'External readings, research papers, trusted links', icon: Target },
  { type: 'text', label: 'Textual Learning', description: 'Structured explanations with rich narrative context', icon: Brain },
  { type: 'visual', label: 'Visual Learning', description: 'Diagrams, flowcharts, and visual representations', icon: Sparkles },
  { type: 'real-world', label: 'Real-World Examples', description: 'Practical scenarios and real-life use cases', icon: Target },
  { type: 'practical', label: 'Hands-On Practice', description: 'Code examples, equations, and case studies', icon: Brain },
] as const;

interface LearningPreferencesSettingsProps {
  onSave?: () => void;
}

export default function LearningPreferencesSettings({ onSave }: LearningPreferencesSettingsProps) {
  const { state, dispatch } = useApp();
  const currentUser = state.currentUser;

  const [learningPreferences, setLearningPreferences] = useState<LearningStyle[]>(
    currentUser?.learningStyle || []
  );

  const { register, handleSubmit, formState: { errors } } = useForm<PreferencesForm>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      autoTest: currentUser?.preferences.autoTest ?? true,
      testFrequency: currentUser?.preferences.testFrequency ?? 'medium',
      explanationDepth: currentUser?.preferences.explanationDepth ?? 'detailed',
    },
  });

  const handleLearningStyleChange = (styleType: typeof learningStyles[0]['type'], preference: number) => {
    setLearningPreferences(prev => {
      const existing = prev.find(s => s.type === styleType);
      if (existing) {
        return prev.map(s => s.type === styleType ? { ...s, preference } : s);
      }
      return [...prev, { type: styleType, preference }];
    });
  };

  const onSubmit = (data: PreferencesForm) => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      learningStyle: learningPreferences.filter(style => style.preference > 0),
      preferences: {
        autoTest: data.autoTest,
        testFrequency: data.testFrequency,
        explanationDepth: data.explanationDepth,
      },
    };

    dispatch({ type: 'SET_USER', payload: updatedUser });
    onSave?.();
  };

  if (!currentUser) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Please complete your profile setup first.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <span>Learning Styles</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Rate each learning style from 1-5 based on your preference (1 = Not Preferred, 5 = Highly Preferred)
            </p>
            
            {learningStyles.map((style) => {
              const currentPreference = learningPreferences.find(p => p.type === style.type)?.preference || 0;
              
              return (
                <motion.div 
                  key={style.type} 
                  className="p-4 border rounded-lg space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-start space-x-3">
                    <style.icon className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{style.label}</h4>
                      <p className="text-sm text-gray-600">{style.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Not Preferred</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => handleLearningStyleChange(style.type, rating)}
                          className={`w-8 h-8 rounded-full border-2 transition-all duration-200 text-sm font-medium ${
                            rating <= currentPreference
                              ? 'bg-purple-500 border-purple-500 text-white'
                              : 'border-gray-300 hover:border-purple-300 text-gray-600'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">Highly Preferred</span>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-600" />
              <span>Learning Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  {...register('autoTest')}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Enable automatic testing during sessions</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Test Frequency</label>
              <select
                {...register('testFrequency')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="low">Low - End of session only</option>
                <option value="medium">Medium - Every 15-20 minutes</option>
                <option value="high">High - Every 5-10 minutes</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Explanation Depth</label>
              <select
                {...register('explanationDepth')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="brief">Brief - Quick summaries</option>
                <option value="detailed">Detailed - Comprehensive explanations</option>
                <option value="comprehensive">Comprehensive - Deep dive with examples</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </Button>
        </div>
      </form>
    </div>
  );
}