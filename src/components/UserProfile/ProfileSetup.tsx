import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApp } from '../../contexts/AppContext';
import { UserProfile } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  level: z.enum(['naive', 'intermediate', 'expert']),
});

type ProfileForm = z.infer<typeof profileSchema>;

const levelDescriptions = {
  naive: 'New to the subject, needs simplified explanations with minimal jargon',
  intermediate: 'Some knowledge, seeks clarification and structured support',
  expert: 'Advanced understanding, prefers detailed technical explanations',
};

export default function ProfileSetup() {
  const { dispatch } = useApp();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      level: 'intermediate',
    },
  });

  const selectedLevel = watch('level');

  const onSubmit = (data: ProfileForm) => {
    const profile: UserProfile = {
      id: `user-${Date.now()}`,
      name: data.name,
      level: data.level,
      learningStyle: [], // Will be set later via settings
      preferences: {
        autoTest: true,
        testFrequency: 'medium',
        explanationDepth: 'detailed',
      },
    };

    dispatch({ type: 'SET_USER', payload: profile });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your Learning Journey</h1>
          <p className="text-gray-600">Let's get started with some basic information about you</p>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-purple-600" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Your Name"
                  placeholder="Enter your name"
                  {...register('name')}
                  error={errors.name?.message}
                />

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Experience Level</label>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(levelDescriptions).map(([level, description]) => (
                      <label key={level} className="relative">
                        <input
                          type="radio"
                          value={level}
                          {...register('level')}
                          className="sr-only"
                        />
                        <div className={`
                          p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                          ${selectedLevel === level 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-300'
                          }
                        `}>
                          <div className="font-medium text-gray-900 capitalize mb-1">{level}</div>
                          <div className="text-sm text-gray-600">{description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> You can customize your learning preferences and styles anytime after setup 
                    by clicking the settings button in the header.
                  </p>
                </div>

                <Button type="submit" className="w-full">
                  Get Started
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}