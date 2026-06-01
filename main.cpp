#include <iostream>
#include <vector>
#include <string>
#include <fstream>
#include <sstream>
#include <algorithm>
using namespace std;

class Food{
    public:
    string name;
    int calories;
    int protein;
    int carbs;
    int fat;
};
string toLowerCase(string str){
    for(int i = 0; i < str.length(); i++){
        str[i] = tolower((unsigned char)str[i]);
    }
    return str;
}
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
    if(foods.empty()){
        cout << "No foods available." << endl;
        return;
    }
    cout << "Food List:" << endl;
    for(int i = 0; i < foods.size(); i++){
        cout <<i <<". ";
        cout << "Name: " << foods[i].name << endl;
        cout << "Calories: " << foods[i].calories << endl;
        cout << "Protein: " << foods[i].protein << "g" << endl;
        cout << "Carbs: " << foods[i].carbs << "g" << endl;
        cout << "Fat: " << foods[i].fat << "g" << endl;
        cout << endl;
    }
}
int setCalorieGoal(){
    int caloriegoal;
    cout << "Enter your daily calorie goal: ";
    cin >> caloriegoal;
    return caloriegoal;
}
void calculateTotalNutrition(){
    int totalCalories = 0;
    int totalProtein = 0;
    int totalCarbs = 0;
    int totalFat = 0;
    int caloriegoal = setCalorieGoal();
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
        int remainingCalories = caloriegoal - totalCalories;
        cout << "You are within your calorie goal." << endl;
        cout << "Remaining Calories: " << remainingCalories << endl;
    }
    cout << "Total Calories: " << totalCalories << endl;
    cout << "Total Protein: " << totalProtein << "g" << endl;
    cout << "Total Carbs: " << totalCarbs << "g" << endl;
    cout << "Total Fat: " << totalFat << "g" << endl;
}
void deleteFood(){
    if(foods.empty()){
        cout << "No foods available." << endl;
        return;
    }
    displayFoods();
    int index;
    cout << "Enter the index of the food to delete: ";
    cin >> index;
    if(index >= 0 && index < (int)foods.size()){
        foods.erase(foods.begin() + index);
        cout << "Food deleted successfully." << endl;
    }
    else{
        cout << "Invalid index." << endl;
    }
}
void editFood(){
    if(foods.empty()){
        cout << "No foods available." << endl;
        return;
    }
    displayFoods();
    int index;
    cout << "Enter the index of the food to edit: ";
    cin >> index;
    if(index >= 0 && index < (int)foods.size()){
        string name;
        int calories, protein, carbs, fat;
        cout << "Enter new food name: ";
        cin.ignore();
        getline(cin,name);
        cout << "Enter new calories: ";
        cin >> calories;
        cout << "Enter new protein: ";
        cin >> protein;
        cout << "Enter new carbs: ";
        cin >> carbs;
        cout << "Enter new fat: ";
        cin >> fat;
        foods[index].name = name;
        foods[index].calories = calories;
        foods[index].protein = protein;
        foods[index].carbs = carbs;
        foods[index].fat = fat;
        cout << "Food edited successfully." << endl;
    }
    else{
        cout << "Invalid index." << endl;
    }
}
void displayHighestCalorieFood(){
    if(foods.empty()){
        cout << "No foods available." << endl;
        return;
    }
    int maxCalories = foods[0].calories;
    int index = 0;
    for(int i = 1; i < foods.size(); i++){
        if(foods[i].calories > maxCalories){
            maxCalories = foods[i].calories;
            index = i;
        }
    }
    cout << "Highest Calorie Food:" << endl;
    cout << "Name: " << foods[index].name << endl;
    cout << "Calories: " << foods[index].calories << endl;
    cout << "Protein: " << foods[index].protein << "g" << endl;
    cout << "Carbs: " << foods[index].carbs << "g" << endl;
    cout << "Fat: " << foods[index].fat << "g" << endl;
}
void displayAverageCalories(){
    if(foods.empty()){
        cout << "No foods available." << endl;
        return;
    }
    int totalCalories = 0;
    for(int i = 0; i < foods.size(); i++){
        totalCalories += foods[i].calories;
    }
    double averageCalories = static_cast<double>(totalCalories) / foods.size();
    cout << "Average Calories: " << averageCalories << endl;
}
void searchFood(){
    if(foods.empty()){
        cout << "No foods available." << endl;
        return;
    }
    string searchName;
    cout << "Enter food name to search: ";
    cin.ignore();
    getline(cin,searchName);
    searchName = toLowerCase(searchName);
    bool found = false;
    for(int i = 0; i < foods.size(); i++){
        if(toLowerCase(foods[i].name) == searchName){
            cout << "Food Found:" << endl;
            cout << "Name: " << foods[i].name << endl;
            cout << "Calories: " << foods[i].calories << endl;
            cout << "Protein: " << foods[i].protein << "g" << endl;
            cout << "Carbs: " << foods[i].carbs << "g" << endl;
            cout << "Fat: " << foods[i].fat << "g" << endl;
            found = true;
            break;
        }
    }
    if(!found){
        cout << "Food not found." << endl;
    }
}
void saveDataToFile(){
    ofstream outFile("foods.txt");
    if(outFile.is_open()){
        for(int i = 0; i < foods.size(); i++){
            outFile << foods[i].name << "," << foods[i].calories << "," << foods[i].protein << "," << foods[i].carbs << "," << foods[i].fat << endl;
        }
        outFile.close();
        cout << "Data saved to file successfully." << endl;
    }
    else{
        cout << "Unable to open file." << endl;
    }
}
void loadDataFromFile(){
    ifstream inFile("foods.txt");
    if(inFile.is_open()){
        foods.clear();
        string line;
        while(getline(inFile, line)){
            stringstream ss(line);
            string name;
            int calories, protein, carbs, fat;
            getline(ss, name, ',');
            ss >> calories;
            ss.ignore();
            ss >> protein;
            ss.ignore();
            ss >> carbs;
            ss.ignore();
            ss >> fat;
            addFood(name, calories, protein, carbs, fat);
        }
        inFile.close();
    }
    else{
        return;
    }
}
void displayMenu(){
    cout << "1. Add Food" << endl;
    cout << "2. Display Foods" << endl;
    cout << "3. Calculate Total Nutrition" << endl;
    cout << "4. Delete Food" << endl;
    cout << "5. Edit Food" << endl;
    cout << "6. Highest Calorie Food" << endl;
    cout << "7. Average Calories" << endl;
    cout << "8. Search Food" << endl;
    cout << "9. Exit" << endl;
}

int main(){
    loadDataFromFile();
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
                editFood();
                break;
            case 6:
                displayHighestCalorieFood();
                break;
            case 7:
                displayAverageCalories();
                break;
            case 8:
                searchFood();
                break;
            case 9:
                saveDataToFile();
                cout << "Exiting..." << endl;
                break;
            default:
                cout << "Invalid choice. Please try again." << endl;
        }
    } while(choice != 9);
    return 0;
}