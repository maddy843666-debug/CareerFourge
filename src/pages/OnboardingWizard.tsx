import React, { useState } from 'react';
import { ArrowRight, Check, Plus, Upload, FileText, User, Target, Code, ShieldCheck } from 'lucide-react';
import { UserProfileData, CareerGoalData, ClaimedSkillItem } from '../types';

interface OnboardingWizardProps {
  onComplete: (data: {
    profile: UserProfileData;
    goal: CareerGoalData;
    skills: ClaimedSkillItem[];
    resumeFile: string | null;
  }) => void;
}

const PREDEFINED_SKILLS = [
  'Python', 'Java', 'JavaScript', 'React', 'Node.js',
  'SQL', 'DSA', 'FastAPI', 'Git', 'Docker', 'AWS', 'System Design'
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // STEP 1: Basic Profile
  const [fullName, setFullName] = useState('Alex Mercer');
  const [age, setAge] = useState('24');
  const [location, setLocation] = useState('San Francisco, CA');
  const [educationLevel, setEducationLevel] = useState<UserProfileData['educationLevel']>('Undergraduate');
  const [college, setCollege] = useState('University of California');
  const [yearOfStudy, setYearOfStudy] = useState<UserProfileData['yearOfStudy']>('Graduate');

  // STEP 2: Career Goal
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState<CareerGoalData['experienceLevel']>('0–2 years');
  const [targetCompany, setTargetCompany] = useState('Google');
  const [jobDescription, setJobDescription] = useState('');

  // STEP 3: Skills (Claimed)
  const [selectedSkills, setSelectedSkills] = useState<ClaimedSkillItem[]>([
    { skillName: 'Python', claimedLevel: 'Advanced' },
    { skillName: 'SQL', claimedLevel: 'Intermediate' },
    { skillName: 'DSA', claimedLevel: 'Advanced' },
    { skillName: 'FastAPI', claimedLevel: 'Intermediate' }
  ]);
  const [customSkillInput, setCustomSkillInput] = useState('');

  // STEP 4: Resume
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);

  const toggleSkill = (skillName: string) => {
    const existing = selectedSkills.find(s => s.skillName === skillName);
    if (existing) {
      setSelectedSkills(selectedSkills.filter(s => s.skillName !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, { skillName, claimedLevel: 'Intermediate' }]);
    }
  };

  const setSkillLevel = (skillName: string, level: 'Beginner' | 'Intermediate' | 'Advanced') => {
    setSelectedSkills(selectedSkills.map(s => 
      s.skillName === skillName ? { ...s, claimedLevel: level } : s
    ));
  };

  const handleAddCustomSkill = () => {
    if (!customSkillInput.trim()) return;
    const name = customSkillInput.trim();
    if (!selectedSkills.find(s => s.skillName.toLowerCase() === name.toLowerCase())) {
      setSelectedSkills([...selectedSkills, { skillName: name, claimedLevel: 'Intermediate' }]);
    }
    setCustomSkillInput('');
  };

  const handleFinishOnboarding = () => {
    onComplete({
      profile: {
        fullName,
        age,
        location,
        educationLevel,
        college,
        yearOfStudy
      },
      goal: {
        targetRole,
        experienceLevel,
        targetCompany,
        jobDescription
      },
      skills: selectedSkills,
      resumeFile: resumeFileName || 'Alex_Mercer_Resume.pdf'
    });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        
        {/* STEP PROGRESS INDICATOR */}
        <div className="bg-[#0A192F] text-white px-6 py-4 flex justify-between items-center text-xs font-mono">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-white text-[#0A192F] flex items-center justify-center font-extrabold text-[10px]">
              CF
            </div>
            <span className="font-bold tracking-tight text-white">CareerForge AI Onboarding</span>
          </div>
          <span className="text-[#FFDE59] font-bold">
            STEP {step} OF 4
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E2E8F0] h-1">
          <div
            className="bg-[#427AB5] h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>

        {/* FORM STEP CONTENT */}
        <div className="p-8 space-y-6">

          {/* STEP 1: BASIC PROFILE */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-[#0A192F]">Let's get to know you</h2>
                <p className="text-xs text-[#64748B] mt-1">Provide your background details to complete your career profile.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-[#0A192F] block mb-1">Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#0A192F]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#0A192F] block mb-1">Age</label>
                  <input
                    type="text"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#0A192F]"
                  />
                  <span className="text-[10px] text-[#64748B] italic">Age is excluded from ATS & readiness scoring.</span>
                </div>

                <div>
                  <label className="font-semibold text-[#0A192F] block mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#0A192F]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#0A192F] block mb-1">College / University</label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#0A192F]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#0A192F] block mb-1">Education level</label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#0A192F] bg-white"
                  >
                    <option value="High School">High School</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#0A192F] block mb-1">Current status / Year</label>
                  <select
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#0A192F] bg-white"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Working Professional">Working Professional</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-[#0A192F] hover:bg-[#112240] text-white font-semibold text-xs rounded transition-colors flex items-center shadow-sm"
                >
                  Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#FFDE59]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CAREER GOAL */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-[#0A192F]">What are you preparing for?</h2>
                <p className="text-xs text-[#64748B] mt-1">Specify your target role and optionally paste a target job description.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-[#0A192F] block mb-1">Target role</label>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#0A192F] bg-white font-semibold text-[#0A192F]"
                    >
                      <option value="Software Engineer">Software Engineer</option>
                      <option value="Frontend Developer">Frontend Developer</option>
                      <option value="Backend Developer">Backend Developer</option>
                      <option value="Full Stack Developer">Full Stack Developer</option>
                      <option value="Data Analyst">Data Analyst</option>
                      <option value="Data Scientist">Data Scientist</option>
                      <option value="DevOps Engineer">DevOps Engineer</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-[#0A192F] block mb-1">Experience level</label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value as any)}
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#0A192F] bg-white"
                    >
                      <option value="Student">Student</option>
                      <option value="Fresher">Fresher</option>
                      <option value="0–2 years">0–2 years</option>
                      <option value="2–5 years">2–5 years</option>
                      <option value="5+ years">5+ years</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#0A192F] block mb-1">Target company (Optional)</label>
                  <select
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#0A192F] bg-white"
                  >
                    <option value="Google">Google</option>
                    <option value="Microsoft">Microsoft</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Meta">Meta</option>
                    <option value="Other">Other</option>
                    <option value="No specific company">No specific company</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#0A192F] block mb-1">Paste job description (Optional)</label>
                  <textarea
                    rows={3}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste a job description here to analyze a real target role..."
                    className="w-full p-3 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#0A192F] font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-slate-100 text-[#0A192F] font-semibold text-xs rounded hover:bg-slate-200 border border-[#E2E8F0]"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 bg-[#0A192F] hover:bg-[#112240] text-white font-semibold text-xs rounded transition-colors flex items-center shadow-sm"
                >
                  Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#FFDE59]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SKILLS (CLAIMED) */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-[#0A192F]">What are your strongest skills?</h2>
                <p className="text-xs text-[#64748B] mt-1">Select your skills and self-assess your proficiency level.</p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Predefined Grid */}
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_SKILLS.map((sk) => {
                    const isSelected = selectedSkills.some(s => s.skillName === sk);
                    return (
                      <button
                        key={sk}
                        onClick={() => toggleSkill(sk)}
                        className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors flex items-center ${
                          isSelected
                            ? 'bg-[#0A192F] text-white border-[#0A192F]'
                            : 'bg-[#F8FAFC] text-[#0A192F] border-[#E2E8F0] hover:border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 mr-1 text-[#FFDE59]" />}
                        {sk}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Skill */}
                <div className="flex space-x-2 pt-2">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomSkill(); }}
                    placeholder="Add another skill..."
                    className="flex-1 px-3 py-1.5 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#0A192F]"
                  />
                  <button
                    onClick={handleAddCustomSkill}
                    className="px-3 py-1.5 bg-[#427AB5] text-white font-semibold rounded hover:bg-blue-600 flex items-center"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </button>
                </div>

                {/* Selected Skill Levels */}
                {selectedSkills.length > 0 && (
                  <div className="bg-[#F8FAFC] p-4 rounded border border-[#E2E8F0] space-y-3">
                    <span className="font-bold text-[#0A192F] block border-b border-[#E2E8F0] pb-2 text-[11px] font-mono">
                      SET PROFICIENCY FOR SELECTED SKILLS (USER CLAIMS)
                    </span>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selectedSkills.map((sk) => (
                        <div key={sk.skillName} className="flex justify-between items-center bg-white p-2 rounded border border-[#E2E8F0]">
                          <span className="font-semibold text-[#0A192F]">{sk.skillName}</span>
                          <div className="flex space-x-1">
                            {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                              <button
                                key={lvl}
                                onClick={() => setSkillLevel(sk.skillName, lvl)}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                  sk.claimedLevel === lvl
                                    ? 'bg-[#0A192F] text-white border-[#0A192F]'
                                    : 'bg-white text-[#64748B] border-[#E2E8F0]'
                                }`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-slate-100 text-[#0A192F] font-semibold text-xs rounded hover:bg-slate-200 border border-[#E2E8F0]"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 bg-[#0A192F] hover:bg-[#112240] text-white font-semibold text-xs rounded transition-colors flex items-center shadow-sm"
                >
                  Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#FFDE59]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: RESUME UPLOAD */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-[#0A192F]">Add your resume</h2>
                <p className="text-xs text-[#64748B] mt-1">
                  Your resume helps us understand your experience and compare it with your target role.
                </p>
              </div>

              <div className="bg-[#F8FAFC] border-2 border-dashed border-[#E2E8F0] hover:border-[#0A192F] rounded-lg p-8 text-center space-y-3 transition-colors cursor-pointer"
                onClick={() => setResumeFileName('Alex_Mercer_Resume.pdf')}
              >
                <Upload className="w-8 h-8 text-[#427AB5] mx-auto" />
                <div className="text-xs">
                  <span className="font-bold text-[#0A192F]">Drag and drop your resume file</span>
                  <span className="block text-[#64748B] text-[11px] mt-0.5">Supports PDF or DOCX format</span>
                </div>
                <button
                  type="button"
                  className="px-4 py-1.5 bg-white text-[#0A192F] border border-[#E2E8F0] rounded font-semibold text-xs hover:bg-slate-50"
                >
                  Browse File
                </button>
              </div>

              {resumeFileName && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 flex justify-between items-center font-mono">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>{resumeFileName}</span>
                  </div>
                  <span className="font-bold text-emerald-700">Uploaded ✓</span>
                </div>
              )}

              <div className="pt-3 flex justify-between items-center">
                <button
                  onClick={() => setResumeFileName(null)}
                  className="text-xs text-[#64748B] hover:text-[#0A192F] underline"
                >
                  Skip for now
                </button>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setStep(3)}
                    className="px-4 py-2 bg-slate-100 text-[#0A192F] font-semibold text-xs rounded hover:bg-slate-200 border border-[#E2E8F0]"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleFinishOnboarding}
                    className="px-6 py-2.5 bg-[#0A192F] hover:bg-[#112240] text-white font-semibold text-xs rounded transition-colors flex items-center shadow-sm"
                  >
                    Analyze my resume <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#FFDE59]" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
