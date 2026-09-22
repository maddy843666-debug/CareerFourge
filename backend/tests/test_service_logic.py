import unittest
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.ai.services import (
    JobRequirementAnalyzer, ResumeParser, SkillTruthEngine,
    WeaknessDiscoveryEngine, JobGapAnalyzer, ImpactLearningPriorityEngine,
    AdaptiveInterviewEngine, CodingEvaluator, SQLEvaluator,
    JobReadinessCalculator, ImprovementPlanner, RecruiterService
)

class TestReadyRoleBackendServices(unittest.TestCase):

    def test_job_requirement_analyzer(self):
        analyzer = JobRequirementAnalyzer()
        res = analyzer.analyze_job("Software Engineer (Full Stack)")
        self.assertEqual(res.title, "Software Engineer (Full Stack)")
        self.assertTrue(len(res.required_skills) > 0)
        req_names = [s.skill_name for s in res.required_skills]
        self.assertIn("Python", req_names)
        self.assertIn("DSA", req_names)

    def test_resume_parser(self):
        parser = ResumeParser()
        res = parser.parse_resume()
        self.assertEqual(res.compatibility_score, 78.0)
        self.assertIn("Python", res.matched_skills)
        self.assertIn("System Design", res.missing_skills)

    def test_skill_truth_engine(self):
        engine = SkillTruthEngine()
        res = engine.evaluate_skills([])
        self.assertTrue(len(res.skills) >= 4)
        dsa_skill = next(s for s in res.skills if s.skill_name == "DSA")
        self.assertEqual(dsa_skill.claimed_level, "Advanced")
        self.assertEqual(dsa_skill.verified_level, "Intermediate")
        self.assertGreater(dsa_skill.confidence, 0.7)

    def test_job_gap_analyzer(self):
        analyzer = JobGapAnalyzer()
        gaps = analyzer.analyze_gaps()
        self.assertTrue(len(gaps.ready_skills) > 0)
        self.assertTrue(len(gaps.high_priority_gaps) > 0)
        high_gap_names = [s.skill_name for s in gaps.high_priority_gaps]
        self.assertIn("System Design", high_gap_names)

    def test_impact_learning_priority(self):
        planner = ImpactLearningPriorityEngine()
        priorities = planner.calculate_priorities()
        self.assertEqual(priorities[0].skill_name, "DSA") # DSA > System Design > Docker
        self.assertGreater(priorities[0].priority_score, priorities[2].priority_score)

    def test_coding_evaluator(self):
        evaluator = CodingEvaluator()
        res = evaluator.evaluate("def search(nums, target):\n  low, high = 0, len(nums)-1\n  while low <= high: pass")
        self.assertEqual(res.correctness_score, 1.0)
        self.assertEqual(res.time_complexity, "O(log N)")

    def test_sql_evaluator(self):
        evaluator = SQLEvaluator()
        res = evaluator.evaluate("SELECT c.name, SUM(o.total) FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.name;")
        self.assertEqual(res.correctness_score, 1.0)
        self.assertTrue(res.is_valid_syntax)

    def test_job_readiness_calculator(self):
        calc = JobReadinessCalculator()
        res = calc.calculate_readiness()
        self.assertEqual(res.overall_score, 72.0)
        self.assertEqual(res.resume_compatibility, 78.0)
        self.assertEqual(res.sql_score, 88.0)

    def test_reassessment_simulation(self):
        planner = ImprovementPlanner()
        reassessment = planner.simulate_reassessment()
        self.assertEqual(reassessment.previous_readiness_score, 68.0)
        self.assertEqual(reassessment.new_readiness_score, 81.0)
        self.assertEqual(reassessment.score_delta, 13.0)

    def test_recruiter_dashboard(self):
        recruiter = RecruiterService()
        res = recruiter.get_dashboard()
        self.assertEqual(res.total_applicants, 2)
        self.assertEqual(res.applicants[0].decision_support_badge, "Strong Match")

if __name__ == "__main__":
    unittest.main()
