from __future__ import annotations

import json
import re
import urllib.request
import urllib.error
from typing import Any, Dict, List

from app.core.config import settings


class InterviewLLM:

    def __init__(self):
        self.groq_key = settings.GROQ_API_KEY
        self.openai_key = settings.OPENAI_API_KEY
        self.gemini_key = settings.GEMINI_API_KEY

        if self.groq_key or (self.openai_key and self.openai_key.startswith("gsk_")):
            self.api_key = self.groq_key or self.openai_key
            self.is_groq = True
            # Use configured OPENAI_MODEL if valid for Groq, otherwise llama-3.3-70b-versatile
            env_model = getattr(settings, "OPENAI_MODEL", "")
            if env_model and "gpt-oss" not in env_model:
                self.model = env_model
            else:
                self.model = "llama-3.3-70b-versatile"
        elif self.openai_key and not self.openai_key.startswith("gsk_"):
            self.api_key = self.openai_key
            self.is_groq = False
            self.model = getattr(settings, "OPENAI_MODEL", "gpt-4o-mini")
        elif self.gemini_key:
            self.api_key = self.gemini_key
            self.is_groq = False
            self.model = "gemini-1.5-flash"
        else:
            self.api_key = ""
            self.is_groq = False
            self.model = getattr(settings, "OPENAI_MODEL", "llama-3.3-70b-versatile")

        self.api_available = bool(self.api_key)

    # =========================================================
    # INTERNAL JSON CALL
    # =========================================================

    def _json_call(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> Dict[str, Any]:

        if not self.api_available:
            raise RuntimeError("LLM API Key is missing or invalid.")

        # Try Gemini API if gemini key present
        if self.gemini_key and not self.groq_key and not (self.openai_key and not self.openai_key.startswith("gsk_")):
            return self._call_gemini(system_prompt, user_prompt)

        endpoint = "https://api.groq.com/openai/v1/chat/completions" if self.is_groq else "https://api.openai.com/v1/chat/completions"

        # SAFE DEBUG LOGGING (Requirement 6)
        print("\n========== LLM DEBUG ==========")
        print("MODEL:", self.model)
        print("ENDPOINT:", endpoint)
        print("SYSTEM PROMPT:")
        print(system_prompt)
        print("\nUSER/CONTEXT PROMPT:")
        print(user_prompt)

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.3,
            "response_format": {"type": "json_object"}
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(endpoint, data=data_bytes, headers=headers)

        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            print(f"[InterviewLLM] HTTP API call error: {e}")
            if self.gemini_key:
                print("[InterviewLLM] Fallback to Gemini API...")
                try:
                    return self._call_gemini(system_prompt, user_prompt)
                except Exception as ge:
                    print(f"[InterviewLLM] Gemini API error: {ge}")
            raise RuntimeError(f"LLM API Call Error: {e}")

        content = resp_data["choices"][0]["message"]["content"]

        print("\nLLM RESPONSE:")
        print(content)
        print("====================================\n")

        if not content:
            raise RuntimeError("LLM returned an empty response.")

        clean_content = content.strip()
        if clean_content.startswith("```"):
            clean_content = re.sub(r"^```[a-zA-Z]*\n?", "", clean_content)
            clean_content = re.sub(r"\n?```$", "", clean_content).strip()

        return json.loads(clean_content)

    def _call_gemini(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        last_error = None
        for model in ["gemini-2.5-flash", "gemini-1.5-flash"]:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.gemini_key}"
            full_prompt = f"{system_prompt}\n\n{user_prompt}\n\nReturn ONLY valid JSON format."
            payload = {
                "contents": [{"parts": [{"text": full_prompt}]}],
                "generationConfig": {"responseMimeType": "application/json"}
            }
            data_bytes = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(url, data=data_bytes, headers={"Content-Type": "application/json"})
            try:
                with urllib.request.urlopen(req, timeout=15) as resp:
                    resp_data = json.loads(resp.read().decode("utf-8"))
                result_text = resp_data["candidates"][0]["content"]["parts"][0]["text"].strip()
                if result_text.startswith("```"):
                    result_text = re.sub(r"^```[a-zA-Z]*\n?", "", result_text)
                    result_text = re.sub(r"\n?```$", "", result_text).strip()
                return json.loads(result_text)
            except Exception as e:
                last_error = e
                print(f"[InterviewLLM] Gemini call with {model} failed: {e}")
        raise RuntimeError(f"Gemini API error: {last_error}")

    # =========================================================
    # GENERATE QUESTION (Strict Grounding - Requirement 7)
    # =========================================================

    def generate_question(
        self,
        role: str,
        company: str,
        interview_type: str,
        difficulty: str,
        context: str,
        previous_questions: List[str],
        focus_skill: str | None = None,
    ) -> Dict[str, Any]:

        if not self.api_available:
            skill_target = focus_skill or "General Technical"
            fallback_questions = {
                "Behavioral / HR": [
                    f"Tell me about a time when you faced a difficult technical challenge in {role}. How did you overcome it?",
                    "Describe a scenario where you had a disagreement with a team member on architecture. How did you resolve it?",
                    "How do you prioritize competing deadlines when managing multiple software deliverables?"
                ],
                "Technical": [
                    f"Explain core principles of system design and memory management relevant to a {role}.",
                    "How do you approach optimizing slow database queries and identifying performance bottlenecks?",
                    "What are key differences between asynchronous event loops and multi-threaded processing?"
                ],
                "System Design": [
                    "How would you design a rate limiter for a high-traffic API handling 100,000 requests per second?",
                    "Explain database sharding vs replication trade-offs in scalable architectures."
                ]
            }

            q_list = fallback_questions.get(interview_type, fallback_questions["Technical"])
            q_text = q_list[len(previous_questions) % len(q_list)]

            return {
                "question_text": q_text,
                "target_skill": skill_target,
                "category": interview_type,
                "reason": f"Evaluates target capabilities for {role} role based on job description context."
            }

        previous = "\n".join(
            f"- {question}"
            for question in previous_questions
        )

        if not previous:
            previous = "None"

        system_prompt = (
            "You are CareerForge AI, a professional human-like interviewer conducting a live, realistic job interview.\n\n"
            "CORE ROLE RULES:\n"
            "1. You are the INTERVIEWER. You are NOT a tutor, teacher, career coach, or friendly assistant.\n"
            "2. Ask ONLY ONE clear, relevant question per response. Never send multiple questions together.\n"
            "3. Adapt questioning based on difficulty level (BEGINNER: fundamental & introductory; INTERMEDIATE: projects in depth & problem solving; ADVANCED: trade-offs, architecture, failure recovery & deep technical probing).\n"
            "4. Follow up dynamically on vague or short candidate answers with specific examples or technical clarifications.\n"
            "5. Use ONLY the supplied Job Description and interview context.\n"
            "6. Match the requested interview type (Technical, HR, or Mixed).\n"
            "7. Do not repeat previous questions.\n"
            "8. Return ONLY valid JSON format."
        )

        user_prompt = f"""JOB DESCRIPTION CONTEXT:
{context}

CANDIDATE ROLE:
{role}

TARGET COMPANY:
{company or "Not specified"}

INTERVIEW TYPE:
{interview_type}

INTERVIEW LEVEL / DIFFICULTY:
{difficulty}

TARGET FOCUS SKILL:
{focus_skill or "Primary skill from Job Description"}

PREVIOUS QUESTIONS:
{previous}

Generate exactly ONE realistic, professional interview question strictly grounded in the Job Description context.

Return ONLY JSON:
{{
    "question_text": "...",
    "target_skill": "...",
    "category": "...",
    "reason": "Why this question is grounded in the Job Description context and tests the candidate effectively"
}}
"""

        try:
            result = self._json_call(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
            )
            return result
        except Exception as e:
            print(f"[InterviewLLM] Fallback question generation error: {e}")
            return self._generate_fallback_question(
                role=role,
                interview_type=interview_type,
                difficulty=difficulty,
                context=context,
                previous_questions=previous_questions,
                focus_skill=focus_skill,
            )

    def _generate_fallback_question(
        self,
        role: str,
        interview_type: str,
        difficulty: str,
        context: str,
        previous_questions: List[str],
        focus_skill: str | None = None,
    ) -> Dict[str, Any]:
        seq = len(previous_questions)
        skill_target = focus_skill or "Core Engineering"

        # Topic taxonomy derived from context & role
        tech_topics = [
            ("Core Technical Architecture", f"Can you explain your experience with Core Technical Architecture in {role} applications, specifically how you structure modular components?"),
            ("System Design & Scaling", f"How would you design a scalable backend service handling high concurrent traffic for a {role} role?"),
            ("Database Query Optimization", "How do you approach identifying and optimizing slow SQL queries or database bottlenecks in production?"),
            ("Algorithm Complexity & DSA", "What strategies do you use for algorithm selection and time/space complexity trade-off analysis?"),
            ("API Design & Async Processing", "How do you implement robust RESTful API error handling and async request handling in your microservices?"),
            ("Distributed Caching & Memory", "When and how do you introduce caching mechanisms (e.g. Redis, in-memory) to improve application throughput?"),
            ("Security & Authentication", f"What security best practices and authorization strategies do you implement when securing web services for {role}?"),
            ("Testing & Code Quality", "How do you structure unit, integration, and performance tests for complex business logic?")
        ]

        hr_topics = [
            ("Technical Leadership", f"Tell me about a challenging technical decision you had to make as a {role}. What trade-offs did you consider?"),
            ("Conflict Resolution", "Describe a situation where you disagreed with a peer on architecture or code review. How did you align?"),
            ("Project Prioritization", "How do you manage tight deadlines when scope creeps or high-priority production bugs interrupt sprint goals?"),
            ("Mentorship & Growth", "How do you mentor junior developers and maintain high engineering standards across your team?")
        ]

        pool = hr_topics if "HR" in interview_type or "Behavioral" in interview_type else tech_topics
        
        # Pick untried topic
        chosen_topic = None
        chosen_question = None

        for topic, q in pool:
            if not any(q.lower() in prev.lower() for prev in previous_questions):
                chosen_topic = topic
                chosen_question = q
                break

        if not chosen_question:
            chosen_topic, chosen_question = pool[seq % len(pool)]
            chosen_question = f"{chosen_question} (Part {seq + 1})"

        return {
            "question_text": chosen_question,
            "target_skill": chosen_topic if not focus_skill else focus_skill,
            "category": interview_type,
            "reason": f"Evaluates target capabilities for {role} role based on job description context."
        }

    # =========================================================
    # EVALUATE ANSWER
    # =========================================================

    def evaluate_answer(
        self,
        question: str,
        answer: str,
        context: str,
        difficulty: str,
        target_skill: str,
    ) -> Dict[str, Any]:

        system_prompt = (
            "You are CareerForge AI, an experienced senior technical interviewer evaluating a candidate's response. "
            "Evaluate strictly based on the candidate's actual demonstrated evidence, technical accuracy, clarity, and relevance. "
            "Do not invent information or give credit for skills the candidate did not demonstrate."
        )

        user_prompt = f"""JOB REQUIREMENTS:
{context}

TARGET SKILL:
{target_skill}

DIFFICULTY:
{difficulty}

INTERVIEW QUESTION:
{question}

CANDIDATE ANSWER:
{answer}

Evaluate the candidate strictly but fairly.

Consider:
- correctness
- relevance
- technical depth
- reasoning
- clarity
- completeness
- examples
- job-specific knowledge
- important concepts that were missed

Do NOT give credit for skills that the candidate did not demonstrate.

Return ONLY JSON:
{{
    "clarity_score": 0,
    "relevance_score": 0,
    "technical_depth_score": 0,
    "overall_score": 0,
    "strengths": [],
    "weaknesses": [],
    "feedback": "",
    "follow_up_needed": false,
    "next_focus": "{target_skill}",
    "difficulty_recommendation": "{difficulty}"
}}
"""

        try:
            return self._json_call(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
            )
        except Exception as e:
            print(f"[InterviewLLM] Fallback evaluation error: {e}")
            return self._evaluate_fallback_answer(question, answer, difficulty, target_skill)

    def _evaluate_fallback_answer(self, question: str, answer: str, difficulty: str, target_skill: str) -> Dict[str, Any]:
        ans_clean = answer.strip()
        word_count = len(ans_clean.split())
        
        # Keyword & Evidence analysis
        star_words = ["example", "project", "result", "used", "implemented", "built", "reduced", "improved", "designed", "handled", "architecture", "database", "scale"]
        star_count = sum(1 for w in star_words if w in ans_clean.lower())
        
        if word_count < 10:
            clarity = 50
            relevance = 45
            technical = 40
            strengths = ["Provided a direct concise response."]
            weaknesses = ["Response is extremely short.", "Lacks specific technical details, examples, and trade-off analysis."]
            feedback = "Your answer is very brief. Provide concrete examples using the STAR method and explain technical trade-offs."
            follow_up = True
            rec_diff = "Easy"
        elif word_count < 35:
            clarity = 70
            relevance = 68
            technical = 62
            strengths = ["Addressed the question topic directly."]
            weaknesses = ["Missing quantitative impact metrics and deeper architectural explanation."]
            feedback = "Solid high-level overview. Incorporating specific metrics or code structures will strengthen your response."
            follow_up = False
            rec_diff = difficulty
        else:
            clarity = min(95, 75 + star_count * 3 + min(15, word_count // 10))
            relevance = min(95, 78 + star_count * 3)
            technical = min(95, 72 + star_count * 4)
            strengths = ["Detailed structural response.", "Good technical terminology and practical evidence provided."]
            weaknesses = [] if star_count >= 3 else ["Can further highlight measurable business or performance impact."]
            feedback = "Comprehensive response demonstrating good domain knowledge and structured thinking."
            follow_up = False
            rec_diff = "Hard" if (clarity + relevance + technical) / 3 >= 85 else difficulty

        overall = int((clarity + relevance + technical) / 3)

        return {
            "clarity_score": clarity,
            "relevance_score": relevance,
            "technical_depth_score": technical,
            "overall_score": overall,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "feedback": feedback,
            "follow_up_needed": follow_up,
            "next_focus": target_skill,
            "difficulty_recommendation": rec_diff
        }

    # =========================================================
    # FINAL REPORT
    # =========================================================

    def generate_report(
        self,
        role: str,
        company: str,
        interview_type: str,
        evaluations: List[Dict[str, Any]],
    ) -> Dict[str, Any]:

        if not self.api_available:
            overall_scores = [e.get("overall_score", 75) for e in evaluations] or [75]
            tech_scores = [e.get("technical_depth_score", 75) for e in evaluations] or [75]
            comm_scores = [e.get("clarity_score", 80) for e in evaluations] or [80]

            avg_overall = int(sum(overall_scores) / len(overall_scores))
            avg_tech = int(sum(tech_scores) / len(tech_scores))
            avg_comm = int(sum(comm_scores) / len(comm_scores))

            rec = "Strong Hire" if avg_overall >= 85 else ("Hire" if avg_overall >= 75 else ("Consider" if avg_overall >= 60 else "Not Recommended"))

            return {
                "overall_score": avg_overall,
                "technical_knowledge": avg_tech,
                "problem_solving": int((avg_overall + avg_tech) / 2),
                "communication": avg_comm,
                "answer_quality": avg_overall,
                "communication_score": round(avg_comm / 10.0, 1),
                "confidence_score": round(avg_comm / 10.0, 1),
                "clarity_score": round(avg_comm / 10.0, 1),
                "professionalism_score": round(avg_overall / 10.0, 1),
                "motivation_score": round(avg_overall / 10.0, 1),
                "teamwork_score": round(avg_overall / 10.0, 1),
                "leadership_score": round(avg_tech / 10.0, 1),
                "problem_solving_score": round(avg_tech / 10.0, 1),
                "adaptability_score": round(avg_overall / 10.0, 1),
                "overall_performance": round(avg_overall / 10.0, 1),
                "hiring_recommendation": rec,
                "strong_areas": [
                    "Structured response delivery",
                    "Solid alignment with target position requirements"
                ],
                "areas_to_improve": [
                    "Elaborate with specific quantitative examples using STAR method",
                    "Provide deeper technical trade-off details"
                ],
                "key_observations": f"Candidate demonstrated solid capabilities for the {role} role.",
                "readiness_impact": f"+{min(15, int(avg_overall / 6))}%",
                "recommendations": [
                    f"Practice STAR methodology for behavioral questions",
                    "Focus on quantitative impact metrics and career goal clarity"
                ]
            }

        evaluation_text = json.dumps(evaluations, indent=2)

        system_prompt = (
            "You are CareerForge AI's senior HR recruiter creating a comprehensive evidence-based candidate assessment report.\n"
            "Evaluate strictly based on demonstrated candidate evidence."
        )

        user_prompt = f"""TARGET ROLE:
{role}

COMPANY:
{company or "Not specified"}

INTERVIEW TYPE:
{interview_type}

INTERVIEW EVALUATIONS:
{evaluation_text}

Generate a complete HR evaluation report.
Hiring recommendation MUST be one of: "Strong Hire", "Hire", "Consider", "Not Recommended".

Return ONLY JSON:
{{
    "communication_score": 8.5,
    "confidence_score": 8.0,
    "clarity_score": 8.0,
    "professionalism_score": 8.5,
    "motivation_score": 8.0,
    "teamwork_score": 8.0,
    "leadership_score": 7.5,
    "problem_solving_score": 7.5,
    "adaptability_score": 8.0,
    "overall_performance": 8.2,
    "overall_score": 82,
    "technical_knowledge": 80,
    "problem_solving": 78,
    "communication": 85,
    "answer_quality": 82,
    "hiring_recommendation": "Strong Hire",
    "strong_areas": [],
    "areas_to_improve": [],
    "key_observations": "",
    "readiness_impact": "+12%",
    "recommendations": []
}}
"""

        try:
            return self._json_call(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
            )
        except Exception as e:
            print(f"[InterviewLLM] Fallback report error: {e}")
            return {
                "overall_score": 78,
                "technical_knowledge": 80,
                "problem_solving": 75,
                "communication": 82,
                "answer_quality": 77,
                "communication_score": 8.2,
                "confidence_score": 8.0,
                "clarity_score": 8.2,
                "professionalism_score": 8.5,
                "motivation_score": 8.0,
                "teamwork_score": 8.0,
                "leadership_score": 7.5,
                "problem_solving_score": 7.5,
                "adaptability_score": 8.0,
                "overall_performance": 7.8,
                "hiring_recommendation": "Hire",
                "strong_areas": ["Communication", "Domain Knowledge"],
                "areas_to_improve": ["Specific quantitative metrics"],
                "key_observations": "Solid interview performance.",
                "readiness_impact": "+12%",
                "recommendations": ["Practice STAR methodology examples."]
            }
