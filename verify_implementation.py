#!/usr/bin/env python3
"""
Verification script for calories app enhancements
Checks that all required files, functions, and endpoints exist
"""

import os
import sys
from pathlib import Path

def check_file_exists(filepath, description):
    """Check if a file exists"""
    if os.path.exists(filepath):
        print(f"✅ {description}: {filepath}")
        return True
    else:
        print(f"❌ {description} MISSING: {filepath}")
        return False

def check_file_contains(filepath, search_string, description):
    """Check if a file contains a specific string"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            if search_string in content:
                print(f"✅ {description}")
                return True
            else:
                print(f"❌ {description} NOT FOUND in {filepath}")
                return False
    except Exception as e:
        print(f"❌ Error reading {filepath}: {e}")
        return False

def main():
    print("=" * 70)
    print("CALORIES APP - IMPLEMENTATION VERIFICATION")
    print("=" * 70)
    print()
    
    all_checks_passed = True
    
    # Check frontend service files
    print("📁 FRONTEND SERVICE LAYER")
    print("-" * 70)
    all_checks_passed &= check_file_exists(
        "CalorieMobileApp/src/services/mealPlans.ts",
        "Meal Plans Service"
    )
    all_checks_passed &= check_file_exists(
        "CalorieMobileApp/src/services/recipes.ts",
        "Recipes Service"
    )
    all_checks_passed &= check_file_exists(
        "CalorieMobileApp/src/services/analytics.ts",
        "Analytics Service"
    )
    print()
    
    # Check service methods
    print("🔧 SERVICE METHODS")
    print("-" * 70)
    all_checks_passed &= check_file_contains(
        "CalorieMobileApp/src/services/mealPlans.ts",
        "deleteMealPlanEntry",
        "Delete meal plan entry method"
    )
    all_checks_passed &= check_file_contains(
        "CalorieMobileApp/src/services/mealPlans.ts",
        "saveTemplate",
        "Save template method"
    )
    all_checks_passed &= check_file_contains(
        "CalorieMobileApp/src/services/recipes.ts",
        "updateRecipe",
        "Update recipe method"
    )
    all_checks_passed &= check_file_contains(
        "CalorieMobileApp/src/services/recipes.ts",
        "deleteRecipe",
        "Delete recipe method"
    )
    all_checks_passed &= check_file_contains(
        "CalorieMobileApp/src/services/analytics.ts",
        "getAIInsights",
        "Get AI insights method"
    )
    print()
    
    # Check screen implementations
    print("📱 SCREEN IMPLEMENTATIONS")
    print("-" * 70)
    all_checks_passed &= check_file_contains(
        "CalorieMobileApp/src/screens/meals/MealPlanScreen.tsx",
        "handleDeleteMeal",
        "MealPlanScreen - Delete meal handler"
    )
    all_checks_passed &= check_file_contains(
        "CalorieMobileApp/src/screens/meals/MealPlanScreen.tsx",
        "handleSaveAsTemplate",
        "MealPlanScreen - Save template handler"
    )
    all_checks_passed &= check_file_contains(
        "CalorieMobileApp/src/screens/recipes/RecipeBuilderScreen.tsx",
        "handleDeleteRecipe",
        "RecipeBuilderScreen - Delete recipe handler"
    )
    all_checks_passed &= check_file_contains(
        "CalorieMobileApp/src/screens/recipes/RecipeBuilderScreen.tsx",
        "editingRecipeId",
        "RecipeBuilderScreen - Edit state"
    )
    all_checks_passed &= check_file_contains(
        "CalorieMobileApp/src/screens/insights/NutrientInsightsScreen.tsx",
        "fetchAIInsights",
        "NutrientInsightsScreen - AI insights handler"
    )
    all_checks_passed &= check_file_contains(
        "CalorieMobileApp/src/screens/insights/NutrientInsightsScreen.tsx",
        "aiInsights",
        "NutrientInsightsScreen - AI insights state"
    )
    print()
    
    # Check backend enhancements
    print("🔌 BACKEND API")
    print("-" * 70)
    all_checks_passed &= check_file_contains(
        "routes/meal_plans.py",
        "elif 'date' in data and 'meal_type' in data",
        "Meal Plans API - Single meal format support"
    )
    print()
    
    # Check database migration
    print("🗄️ DATABASE MIGRATION")
    print("-" * 70)
    all_checks_passed &= check_file_exists(
        "migrations/versions/002_add_meal_plans_and_recipes.py",
        "Meal Plans & Recipes Migration"
    )
    all_checks_passed &= check_file_contains(
        "migrations/versions/002_add_meal_plans_and_recipes.py",
        "op.create_table",
        "Migration - create_table calls"
    )
    all_checks_passed &= check_file_contains(
        "migrations/versions/002_add_meal_plans_and_recipes.py",
        "'meal_plan'",
        "Migration - meal_plan table"
    )
    all_checks_passed &= check_file_contains(
        "migrations/versions/002_add_meal_plans_and_recipes.py",
        "'recipe'",
        "Migration - recipe table"
    )
    print()
    
    # Check documentation
    print("📚 DOCUMENTATION")
    print("-" * 70)
    all_checks_passed &= check_file_exists(
        "PROJECT_ANALYSIS_REPORT.md",
        "Project Analysis Report"
    )
    all_checks_passed &= check_file_exists(
        "ENHANCEMENTS_COMPLETED.md",
        "Enhancements Documentation"
    )
    all_checks_passed &= check_file_exists(
        "FINAL_IMPLEMENTATION_SUMMARY.md",
        "Implementation Summary"
    )
    print()
    
    # Final result
    print("=" * 70)
    if all_checks_passed:
        print("✅ ALL CHECKS PASSED - Implementation Complete!")
        print("=" * 70)
        print()
        print("Next Steps:")
        print("1. Run backend: python app.py")
        print("2. Run frontend: cd CalorieMobileApp && npm start")
        print("3. Test all new features manually")
        print("4. Review documentation files for details")
        return 0
    else:
        print("❌ SOME CHECKS FAILED - Review errors above")
        print("=" * 70)
        return 1

if __name__ == "__main__":
    sys.exit(main())
