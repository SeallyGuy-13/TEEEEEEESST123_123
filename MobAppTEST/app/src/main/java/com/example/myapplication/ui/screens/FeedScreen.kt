package com.example.myapplication.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

data class Event(val id: String, val title: String, val city: String, val description: String)

val mockEvents = listOf(
    Event("1", "Концерт Рок-группы", "Москва", "Большой концерт в центре города."),
    Event("2", "Выставка искусств", "Санкт-Петербург", "Современное искусство в музее."),
    Event("3", "Марафон", "Москва", "Ежегодный забег на 10 км."),
    Event("4", "Мастер-класс по готовке", "Казань", "Учимся готовить татарские блюда."),
    Event("5", "ИТ Конференция", "Санкт-Петербург", "Крупнейшая конференция для разработчиков.")
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedScreen() {
    var selectedCity by remember { mutableStateOf("Все") }
    
    val cities = listOf("Все") + mockEvents.map { it.city }.distinct().sorted()
    val filteredEvents = if (selectedCity == "Все") {
        mockEvents
    } else {
        mockEvents.filter { it.city == selectedCity }
    }

    var expanded by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text(text = "Доступные активности", style = MaterialTheme.typography.headlineMedium)
        
        Spacer(modifier = Modifier.height(16.dp))
        
        ExposedDropdownMenuBox(
            expanded = expanded,
            onExpandedChange = { expanded = !expanded }
        ) {
            OutlinedTextField(
                value = selectedCity,
                onValueChange = {},
                readOnly = true,
                label = { Text("Город") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                modifier = Modifier.menuAnchor().fillMaxWidth()
            )
            ExposedDropdownMenu(
                expanded = expanded,
                onDismissRequest = { expanded = false }
            ) {
                cities.forEach { city ->
                    DropdownMenuItem(
                        text = { Text(text = city) },
                        onClick = {
                            selectedCity = city
                            expanded = false
                        }
                    )
                }
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(filteredEvents) { event ->
                EventCard(event)
            }
        }
    }
}

@Composable
fun EventCard(event: Event) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = event.title, style = MaterialTheme.typography.titleMedium)
            Text(text = event.city, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.secondary)
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = event.description, style = MaterialTheme.typography.bodyMedium)
        }
    }
}
