package com.example.myapplication.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.myapplication.ui.screens.FeedScreen
import com.example.myapplication.ui.screens.ProfileScreen
import com.example.myapplication.ui.screens.GameScreen

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    var isLoggedIn by remember { mutableStateOf(false) }

    Scaffold(
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    icon = { Text("Лента") },
                    label = { Text("События") },
                    selected = currentRoute == "feed",
                    onClick = {
                        navController.navigate("feed") {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
                NavigationBarItem(
                    icon = { Text(if (isLoggedIn) "Профиль" else "Вход") },
                    label = { Text(if (isLoggedIn) "Профиль" else "Вход") },
                    selected = currentRoute == "profile",
                    onClick = {
                        navController.navigate("profile") {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
                NavigationBarItem(
                    icon = { Text("Игра") },
                    label = { Text("Игра") },
                    selected = currentRoute == "game",
                    onClick = {
                        navController.navigate("game") {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "feed",
            modifier = Modifier.padding(innerPadding)
        ) {
            composable("feed") { FeedScreen() }
            composable("profile") { 
                ProfileScreen(
                    isLoggedIn = isLoggedIn,
                    onLoginStateChanged = { isLoggedIn = it }
                ) 
            }
            composable("game") { GameScreen() }
        }
    }
}
