#include <iostream>
#include <bits/stdc++.h>
using namespace std;

class Food{
    public:
    string name;
    int calories;
    int protein;
    int carbs;
    int fat;
};
vector<Food> foods;
void addFood(string name, int calories, int protein, int carbs, int fat){
    Food food;
    food.name = name;
    food.calories = calories;
    food.protein = protein;
    food.carbs = carbs;
    food.fat = fat;
    foods.push_back(food);
}
void displayFoods(){
    for(int i = 0; i < foods.size(); i++){
        cout << "Name: " << foods[i].name << endl;
        cout << "Calories: " << foods[i].calories << endl;
        cout << "Protein: " << foods[i].protein << "g" << endl;
        cout << "Carbs: " << foods[i].carbs << "g" << endl;
        cout << "Fat: " << foods[i].fat << "g" << endl;
        cout << endl;
    }
}
void calculateTotalNutrition(){
    int totalCalories = 0;
    int totalProtein = 0;
    int totalCarbs = 0;
    int totalFat = 0;
    int caloriegoal = 2000;
    for(int i = 0; i < foods.size(); i++){
        totalCalories += foods[i].calories;
        totalProtein += foods[i].protein;
        totalCarbs += foods[i].carbs;
        totalFat += foods[i].fat;
    }

    if(totalCalories > caloriegoal){
        int excessCalories = totalCalories - caloriegoal;
        cout << "You have exceeded your calorie goal by " << excessCalories << " calories." << endl;
    }
    else{
        int remainingCalories = abs(caloriegoal - totalCalories);
        cout << "You are within your calorie goal." << endl;
        cout << "Remaining Calories: " << remainingCalories << endl;
    }
    cout << "Total Calories: " << totalCalories << endl;
    cout << "Total Protein: " << totalProtein << "g" << endl;
    cout << "Total Carbs: " << totalCarbs << "g" << endl;
    cout << "Total Fat: " << totalFat << "g" << endl;
}
void deleteFood(){
    int index;
    cout << "Enter the index of the food to delete: ";
    cin >> index;
    if(index >= 0 && index < foods.size()){
        foods.erase(foods.begin() + index);
        cout << "Food deleted successfully." << endl;
    }
    else{
        cout << "Invalid index." << endl;
    }
}
void displayMenu(){
    cout << "1. Add Food" << endl;
    cout << "2. Display Foods" << endl;
    cout << "3. Calculate Total Nutrition" << endl;
    cout << "4. Delete Food" << endl;
    cout << "5. Exit" << endl;
}

int main(){
    int choice;
    do{
        displayMenu();
        cout << "Enter your choice: ";
        cin >> choice;
        switch(choice){
            case 1:
            {    string name;
                int calories, protein, carbs, fat;
                cout << "Enter food name: ";
                cin.ignore();
                getline(cin,name);
                cout << "Enter calories: ";
                cin >> calories;
                cout << "Enter protein: ";
                cin >> protein;
                cout << "Enter carbs: ";
                cin >> carbs;
                cout << "Enter fat: ";
                cin >> fat;
                addFood(name, calories, protein, carbs, fat);
                break;
            }
            case 2:
                displayFoods();
                break;
            case 3:
                calculateTotalNutrition();
                break;
            case 4:
                deleteFood();
                break;
            case 5:
                cout << "Exiting..." << endl;
                break;
            default:
                cout << "Invalid choice. Please try again." << endl;
        }
    } while(choice != 5);
    return 0;
}