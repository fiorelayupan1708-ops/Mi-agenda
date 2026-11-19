/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Smartphone, 
  Code2, 
  BookOpen, 
  Rocket, 
  Plus, 
  Trash2, 
  Circle, 
  Copy, 
  Check, 
  FileText, 
  Calendar,
  Flag,
  Pencil,
  Search,
  Tag,
  AlertCircle
} from 'lucide-react';

type Priority = 'Baja' | 'Media' | 'Alta';
type Category = 'Personal' | 'Trabajo' | 'Estudios' | 'Otro';

interface Task {
  id: string;
  title: string;
  date: string;
  priority: Priority;
  category: Category;
  completed: boolean;
  createdAt: string;
}

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const AGENDA_SCREEN_KT = `package com.example.miagenda.ui.screens

import android.app.AlertDialog
import android.app.DatePickerDialog
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Tag
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import java.time.LocalDate
import java.util.Calendar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AgendaScreen() {
    val context = LocalContext.current
    val todayStr = LocalDate.now().toString()

    var taskText by remember { mutableStateOf("") }
    var taskDate by remember { mutableStateOf(todayStr) }
    var taskPriority by remember { mutableStateOf(Priority.MEDIUM) }
    var taskCategory by remember { mutableStateOf(Category.PERSONAL) }
    var searchQuery by remember { mutableStateOf("") }
    var showError by remember { mutableStateOf(false) }
    var expandedCategory by remember { mutableStateOf(false) }

    var editingTaskId by remember { mutableStateOf<String?>(null) }
    var editTitle by remember { mutableStateOf("") }
    var editDate by remember { mutableStateOf(todayStr) }
    
    val taskList = remember { mutableStateListOf<Task>() }

    val totalCount = taskList.size
    val completedCount = taskList.count { it.isCompleted }
    val progressPercent = if (totalCount > 0) (completedCount * 100) / totalCount else 0

    val pendingTasks = taskList
        .filter { !it.isCompleted && it.title.contains(searchQuery, ignoreCase = true) }
        .sortedBy { it.dueDate }
        
    val completedTasks = taskList
        .filter { it.isCompleted && it.title.contains(searchQuery, ignoreCase = true) }
        .sortedBy { it.dueDate }

    val calendar = Calendar.getInstance()
    val datePickerDialog = DatePickerDialog(
        context,
        { _, year, month, dayOfMonth ->
            val m = month + 1
            val formattedMonth = if (m < 10) "0$m" else "$m"
            val formattedDay = if (dayOfMonth < 10) "0$dayOfMonth" else "$dayOfMonth"
            taskDate = "$year-$formattedMonth-$formattedDay"
        },
        calendar.get(Calendar.YEAR),
        calendar.get(Calendar.MONTH),
        calendar.get(Calendar.DAY_OF_MONTH)
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mi Agenda", style = MaterialTheme.typography.titleLarge) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Column(
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = taskText,
                    onValueChange = { 
                        taskText = it 
                        if (showError && it.isNotBlank()) showError = false
                    },
                    label = { Text("Escribe una actividad...") },
                    isError = showError,
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp)
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedButton(
                        onClick = { datePickerDialog.show() },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.DateRange, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(taskDate, style = MaterialTheme.typography.bodySmall)
                    }

                    ExposedDropdownMenuBox(
                        expanded = expandedCategory,
                        onExpandedChange = { expandedCategory = !expandedCategory },
                        modifier = Modifier.weight(1f)
                    ) {
                        OutlinedTextField(
                            value = taskCategory.label,
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Categoría") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedCategory) },
                            modifier = Modifier.menuAnchor().fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        )
                        ExposedDropdownMenu(
                            expanded = expandedCategory,
                            onDismissRequest = { expandedCategory = false }
                        ) {
                            Category.values().forEach { cat ->
                                DropdownMenuItem(
                                    text = { Text(cat.label) },
                                    onClick = {
                                        taskCategory = cat
                                        expandedCategory = false
                                    }
                                )
                            }
                        }
                    }
                }

                Button(
                    onClick = {
                        if (taskText.isBlank()) {
                            showError = true
                        } else {
                            taskList.add(
                                Task(
                                    id = System.currentTimeMillis().toString(),
                                    title = taskText.trim(),
                                    dueDate = taskDate,
                                    priority = taskPriority,
                                    category = taskCategory,
                                    isCompleted = false
                                )
                            )
                            taskText = ""
                            showError = false
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Flag, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Agregar actividad")
                }

                if (showError) {
                    Text(
                        text = "Por favor escribe una actividad (no puede estar vacía).",
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(
                    modifier = Modifier.padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Progreso general", style = MaterialTheme.typography.bodyMedium)
                        Text(text = "$progressPercent% completado", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.primary)
                    }
                    LinearProgressIndicator(
                        progress = progressPercent / 100f,
                        modifier = Modifier.fillMaxWidth().height(8.dp),
                        shape = RoundedCornerShape(4.dp)
                    )
                    Text(text = "$completedCount de $totalCount tareas completadas", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.outline)
                }
            }

            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                label = { Text("Buscar actividad...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                shape = RoundedCornerShape(12.dp)
            )

            if (taskList.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No hay actividades.\\n¡Agrega una arriba!",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.outline
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    if (pendingTasks.isNotEmpty()) {
                        item {
                            Text(
                                text = "Pendientes (\${pendingTasks.size})",
                                style = MaterialTheme.typography.titleMedium,
                                color = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.padding(vertical = 4.dp)
                            )
                        }
                        items(pendingTasks, key = { it.id }) { task ->
                            TaskRow(task, taskList, { editingTaskId = task.id; editTitle = task.title; editDate = task.dueDate }, editingTaskId == task.id, editTitle, { editTitle = it }, editDate, { editDate = it }, { editingTaskId = null }, {
                                val idx = taskList.indexOf(task)
                                if (idx != -1) taskList[idx] = task.copy(title = editTitle.trim(), dueDate = editDate)
                                editingTaskId = null
                            }, todayStr)
                        }
                    }

                    if (completedTasks.isNotEmpty()) {
                        item {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Completadas (\${completedTasks.size})",
                                style = MaterialTheme.typography.titleMedium,
                                color = MaterialTheme.colorScheme.outline,
                                modifier = Modifier.padding(vertical = 4.dp)
                            )
                        }
                        items(completedTasks, key = { it.id }) { task ->
                            TaskRow(task, taskList, { editingTaskId = task.id; editTitle = task.title; editDate = task.dueDate }, editingTaskId == task.id, editTitle, { editTitle = it }, editDate, { editDate = it }, { editingTaskId = null }, {
                                val idx = taskList.indexOf(task)
                                if (idx != -1) taskList[idx] = task.copy(title = editTitle.trim(), dueDate = editDate)
                                editingTaskId = null
                            }, todayStr)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun TaskRow(
    task: Task,
    taskList: MutableList<Task>,
    onStartEdit: () -> Unit,
    isEditing: Boolean,
    editTitle: String,
    onEditTitleChange: (String) -> Unit,
    editDate: String,
    onEditDateChange: (String) -> Unit,
    onCancelEdit: () -> Unit,
    onSaveEdit: () -> Unit,
    todayStr: String
) {
    val context = LocalContext.current
    if (isEditing) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
        ) {
            Column(
                modifier = Modifier.padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = editTitle,
                    onValueChange = onEditTitleChange,
                    label = { Text("Editar nombre") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(10.dp)
                )
                OutlinedTextField(
                    value = editDate,
                    onValueChange = onEditDateChange,
                    label = { Text("Fecha (YYYY-MM-DD)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(10.dp)
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    spacedBy = 8.dp
                ) {
                    TextButton(onClick = onCancelEdit) { Text("Cancelar") }
                    Button(onClick = onSaveEdit, shape = RoundedCornerShape(8.dp)) { Text("Guardar") }
                }
            }
        }
    } else {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            colors = CardDefaults.cardColors(
                containerColor = if (task.isCompleted) MaterialTheme.colorScheme.surface.copy(alpha = 0.6f) else MaterialTheme.colorScheme.surface
            )
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Checkbox(
                    checked = task.isCompleted,
                    onCheckedChange = { checked ->
                        if (checked && task.dueDate < todayStr) {
                            AlertDialog.Builder(context)
                                .setTitle("Fecha de ejecución anterior a hoy")
                                .setMessage("No se puede completar la actividad '\${task.title}'. Su fecha (\${task.dueDate}) es menor a hoy (\${todayStr}). Por favor cambia la fecha primero.")
                                .setPositiveButton("Entendido") { dialog, _ -> dialog.dismiss() }
                                .show()
                        } else {
                            val index = taskList.indexOf(task)
                            if (index != -1) taskList[index] = task.copy(isCompleted = checked)
                        }
                    }
                )

                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = task.title,
                            style = MaterialTheme.typography.bodyLarge,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis,
                            textDecoration = if (task.isCompleted) TextDecoration.LineThrough else TextDecoration.None,
                            color = if (task.isCompleted) MaterialTheme.colorScheme.outline else MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.weight(1f, fill = false)
                        )
                    }

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.DateRange,
                                contentDescription = null,
                                modifier = Modifier.size(12.dp),
                                tint = if (task.dueDate < todayStr && !task.isCompleted) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
                            )
                            Text(
                                text = task.dueDate,
                                style = MaterialTheme.typography.bodySmall,
                                color = if (task.dueDate < todayStr && !task.isCompleted) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }

                IconButton(onClick = onStartEdit) {
                    Icon(Icons.Default.Edit, contentDescription = "Editar", tint = MaterialTheme.colorScheme.primary)
                }

                IconButton(onClick = { taskList.remove(task) }) {
                    Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = MaterialTheme.colorScheme.error)
                }
            }
        }
    }
}`;

const MAIN_ACTIVITY_KT = `package com.example.miagenda

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.example.miagenda.ui.screens.AgendaScreen
import com.example.miagenda.ui.theme.MiAgendaTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MiAgendaTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AgendaScreen()
                }
            }
        }
    }
}`;

const TASK_MODEL_KT = `package com.example.miagenda.model

enum class Priority(val label: String) {
    LOW("Baja"),
    MEDIUM("Media"),
    HIGH("Alta")
}

enum class Category(val label: String) {
    PERSONAL("Personal"),
    WORK("Trabajo"),
    STUDY("Estudios"),
    OTHER("Otro")
}

data class Task(
    val id: String,
    val title: String,
    val dueDate: String,
    val priority: Priority = Priority.MEDIUM,
    val category: Category = Category.PERSONAL,
    var isCompleted: Boolean = false
)`;

const GRADLE_KT = `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.example.miagenda"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.miagenda"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation(platform("androidx.compose:compose-bom:2023.08.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
}`;

const codeFiles: Record<string, string> = {
  AgendaScreen: AGENDA_SCREEN_KT,
  MainActivity: MAIN_ACTIVITY_KT,
  TaskModel: TASK_MODEL_KT,
  Gradle: GRADLE_KT
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'guide' | 'setup'>('simulator');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [selectedCodeFile, setSelectedCodeFile] = useState<'MainActivity' | 'AgendaScreen' | 'TaskModel' | 'Gradle'>('AgendaScreen');

  // Simulator state for "Mi Agenda"
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Estudiar Jetpack Compose y principios de UI', date: getTodayDate(), priority: 'Alta', category: 'Estudios', completed: true, createdAt: '10:00 AM' },
    { id: '2', title: 'Hacer tarea de Matemáticas avanzadas y cálculo integral', date: '2026-11-25', priority: 'Media', category: 'Estudios', completed: false, createdAt: '11:30 AM' },
    { id: '3', title: 'Comprar víveres frescos en el supermercado local', date: getTodayDate(), priority: 'Baja', category: 'Personal', completed: false, createdAt: '02:00 PM' }
  ]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(getTodayDate());
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('Media');
  const [newTaskCategory, setNewTaskCategory] = useState<Category>('Personal');
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Alert Modal state for past date validation
  const [alertModalMsg, setAlertModalMsg] = useState<string | null>(null);

  // Editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('Media');
  const [editCategory, setEditCategory] = useState<Category>('Personal');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) {
      setErrorMsg('Por favor escribe una actividad (no puede estar vacía).');
      return;
    }
    setErrorMsg('');
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskText.trim(),
      date: newTaskDate || getTodayDate(),
      priority: newTaskPriority,
      category: newTaskCategory,
      completed: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText('');
    setNewTaskDate(getTodayDate());
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const willBeCompleted = !t.completed;
        // Validation: execution date cannot be earlier than today when completing
        if (willBeCompleted && t.date < getTodayDate()) {
          setAlertModalMsg(`No se puede completar la actividad "${t.title}". Su fecha (${t.date}) es anterior a hoy (${getTodayDate()}). Por favor actualiza la fecha primero.`);
          return t;
        }
        return { ...t, completed: willBeCompleted };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDate(task.date);
    setEditPriority(task.priority);
    setEditCategory(task.category);
  };

  const saveEdit = (id: string) => {
    if (!editTitle.trim()) return;
    setTasks(tasks.map(t => t.id === id ? { ...t, title: editTitle.trim(), date: editDate, priority: editPriority, category: editCategory } : t));
    setEditingTaskId(null);
  };

  const copyToClipboard = (text: string, fileName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  // Progress stats
  const totalTasks = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Filtered & sorted tasks
  const pendingTasks = tasks
    .filter(t => !t.completed && t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.date.localeCompare(b.date));

  const completedTasks = tasks
    .filter(t => t.completed && t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.date.localeCompare(b.date));

  const getPriorityBadgeStyle = (priority: Priority) => {
    switch (priority) {
      case 'Alta': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Media': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Baja': return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    }
  };

  const getCategoryBadgeStyle = (category: Category) => {
    switch (category) {
      case 'Trabajo': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Estudios': return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
      case 'Personal': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Otro': return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Smartphone className="w-4 h-4" />
            </div>
            <h1 className="text-base font-bold tracking-tight text-white">Mi Agenda</h1>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/50 text-xs">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'simulator'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              App
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'code'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Código
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'guide'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Guía
            </button>
            <button
              onClick={() => setActiveTab('setup')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'setup'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Setup
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area - Mobile-First Optimized Single Column */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 flex flex-col">
        
        {/* TAB 1: SIMULATOR (Mobile-First Native Screen) */}
        {activeTab === 'simulator' && (
          <div className="flex-1 flex flex-col h-[calc(100vh-120px)] bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-200">
            {/* Android App Top App Bar */}
            <div className="bg-emerald-600 px-5 py-4 flex items-center justify-between shadow-lg shrink-0">
              <h2 className="text-base font-bold text-white tracking-wide">Mi Agenda</h2>
              <span className="text-xs bg-emerald-700/80 text-emerald-100 px-3 py-1 rounded-full font-semibold shadow-sm">
                {pendingTasks.length} pendientes
              </span>
            </div>

            {/* App Body Content */}
            <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
              
              {/* Fixed Top Form */}
              <form onSubmit={handleAddTask} className="flex flex-col gap-2 bg-slate-900/90 p-3 rounded-2xl border border-slate-800/80 shadow-md shrink-0" style={{ backgroundColor: '#3b4a70' }}>
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => {
                    setNewTaskText(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Escribe una actividad..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
                    <input
                      type="date"
                      value={newTaskDate}
                      onChange={(e) => setNewTaskDate(e.target.value)}
                      className="bg-transparent text-[11px] text-white focus:outline-none w-full cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
                    <select
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value as Category)}
                      className="bg-transparent text-[11px] text-white focus:outline-none w-full cursor-pointer [&>option]:bg-slate-900"
                    >
                      <option value="Personal">Personal</option>
                      <option value="Trabajo">Trabajo</option>
                      <option value="Estudios">Estudios</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                    className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-[11px] text-white focus:outline-none cursor-pointer [&>option]:bg-slate-900"
                  >
                    <option value="Baja">Prioridad Baja</option>
                    <option value="Media">Prioridad Media</option>
                    <option value="Alta">Prioridad Alta</option>
                  </select>

                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-1.5 rounded-xl text-xs transition-all flex items-center justify-center shadow-md shadow-emerald-500/20 gap-1.5"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Agregar</span>
                  </button>
                </div>
              </form>

              {errorMsg && (
                <p className="text-[11px] text-rose-400 px-1 font-medium shrink-0">{errorMsg}</p>
              )}

              {/* Progress Summary Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-md shrink-0 space-y-2" style={{ backgroundColor: '#3b4a70' }}>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">Progreso general</span>
                  <span className="text-emerald-400">{completionPercentage}% completado</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>{completedCount} de {totalTasks} tareas completadas</span>
                  {completedCount === totalTasks && totalTasks > 0 && (
                    <span className="text-emerald-400 font-bold">¡Todo al día!</span>
                  )}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar actividad..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
                  style={{ backgroundColor: '#3b4a70' }}
                />
              </div>

              {/* Scrollable Tasks Area with Custom Scrollbar */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar" style={{ backgroundColor: '#3b4a70' }}>
                {tasks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <Calendar className="w-10 h-10 stroke-1 mb-2 text-slate-600" />
                    <p className="text-xs font-medium">No hay actividades en tu agenda.</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">Agrega una tarea usando el formulario superior.</p>
                  </div>
                ) : (
                  <>
                    {/* Pending Tasks Section */}
                    {pendingTasks.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
                            Pendientes ({pendingTasks.length})
                          </span>
                          <span className="text-[10px] text-slate-500">Ordenadas por fecha</span>
                        </div>

                        {pendingTasks.map((task) => (
                          <div 
                            key={task.id}
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-md hover:border-slate-700 transition-all group"
                            style={{ backgroundColor: '#3b4a70' }}
                          >
                            {editingTaskId === task.id ? (
                              <div className="space-y-3 animate-in fade-in duration-200">
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="date"
                                    value={editDate}
                                    onChange={(e) => setEditDate(e.target.value)}
                                    className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-[11px] text-white focus:outline-none"
                                  />
                                  <select
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value as Category)}
                                    className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-[11px] text-white focus:outline-none [&>option]:bg-slate-900"
                                  >
                                    <option value="Personal">Personal</option>
                                    <option value="Trabajo">Trabajo</option>
                                    <option value="Estudios">Estudios</option>
                                    <option value="Otro">Otro</option>
                                  </select>
                                </div>
                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setEditingTaskId(null)}
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[11px] font-medium transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => saveEdit(task.id)}
                                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-[11px] font-bold transition-colors"
                                  >
                                    Guardar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  <button
                                    type="button"
                                    onClick={() => toggleTask(task.id)}
                                    className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors shrink-0"
                                    title="Marcar como completada"
                                  >
                                    <Circle className="w-4 h-4" />
                                  </button>

                                  <div className="flex flex-col min-w-0 flex-1 gap-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <span className="text-xs font-semibold text-slate-100 line-clamp-2 leading-snug">
                                        {task.title}
                                      </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                        <Calendar className="w-3 h-3 text-emerald-400" />
                                        <span>{task.date}</span>
                                      </div>
                                      <span className={`text-[9px] px-2 py-0.5 rounded-md border font-semibold ${getCategoryBadgeStyle(task.category)}`}>
                                        {task.category}
                                      </span>
                                      <span className={`text-[9px] px-2 py-0.5 rounded-md border font-semibold ${getPriorityBadgeStyle(task.priority)}`}>
                                        {task.priority}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => startEditing(task)}
                                    className="text-slate-400 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors"
                                    title="Editar"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteTask(task.id)}
                                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Completed Tasks Section */}
                    {completedTasks.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                            Completadas ({completedTasks.length})
                          </span>
                        </div>

                        {completedTasks.map((task) => (
                          <div 
                            key={task.id}
                            className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 opacity-75 hover:opacity-100 transition-all"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => toggleTask(task.id)}
                                  className="mt-0.5 text-emerald-400 transition-colors shrink-0"
                                  title="Marcar como pendiente"
                                >
                                  <Check className="w-4 h-4 bg-emerald-500/20 rounded p-0.5 text-emerald-400" />
                                </button>

                                <div className="flex flex-col min-w-0 flex-1 gap-1">
                                  <span className="text-xs font-medium text-slate-400 line-through line-clamp-2 leading-snug">
                                    {task.title}
                                  </span>

                                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                      <Calendar className="w-3 h-3 text-slate-500" />
                                      <span>{task.date}</span>
                                    </div>
                                    <span className={`text-[9px] px-2 py-0.5 rounded-md border font-semibold ${getCategoryBadgeStyle(task.category)} opacity-80`}>
                                      {task.category}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => deleteTask(task.id)}
                                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CODE VIEWER */}
        {activeTab === 'code' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-emerald-400" />
                  <span>Código Kotlin con Validación de Fecha</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Archivos completos listos para Android Studio.</p>
              </div>

              <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => setSelectedCodeFile('AgendaScreen')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCodeFile === 'AgendaScreen'
                      ? 'bg-emerald-500 text-slate-950 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  AgendaScreen.kt
                </button>
                <button
                  onClick={() => setSelectedCodeFile('MainActivity')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCodeFile === 'MainActivity'
                      ? 'bg-emerald-500 text-slate-950 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  MainActivity.kt
                </button>
                <button
                  onClick={() => setSelectedCodeFile('TaskModel')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCodeFile === 'TaskModel'
                      ? 'bg-emerald-500 text-slate-950 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Task.kt
                </button>
                <button
                  onClick={() => setSelectedCodeFile('Gradle')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCodeFile === 'Gradle'
                      ? 'bg-emerald-500 text-slate-950 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  build.gradle.kts
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>
                    {selectedCodeFile === 'AgendaScreen' && 'app/src/main/java/com/example/miagenda/ui/screens/AgendaScreen.kt'}
                    {selectedCodeFile === 'MainActivity' && 'app/src/main/java/com/example/miagenda/MainActivity.kt'}
                    {selectedCodeFile === 'TaskModel' && 'app/src/main/java/com/example/miagenda/model/Task.kt'}
                    {selectedCodeFile === 'Gradle' && 'app/build.gradle.kts'}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(codeFiles[selectedCodeFile], selectedCodeFile)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                >
                  {copiedFile === selectedCodeFile ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copiar código</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-6 overflow-x-auto bg-slate-950/90 font-mono text-xs leading-relaxed text-slate-300 max-h-[550px]">
                <pre><code>{codeFiles[selectedCodeFile]}</code></pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DIDACTIC GUIDE */}
        {activeTab === 'guide' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Validación de Fechas en Kotlin</h2>
                  <p className="text-sm text-slate-400">Cómo validar fechas anteriores antes de completar tareas.</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                <p>
                  En esta versión de <strong>Mi Agenda</strong>, se implementó una validación estricta al marcar una tarea como completada: si la fecha de ejecución programada es menor a la fecha actual del sistema, la app detiene la acción y muestra un cuadro de diálogo (<code className="text-emerald-400 font-mono">AlertDialog</code>) solicitando al usuario actualizar la fecha primero.
                </p>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                  <p className="text-emerald-400">// Ejemplo en Jetpack Compose</p>
                  <p>if (checked && task.dueDate &lt; todayStr) {'{'}</p>
                  <p className="pl-4">AlertDialog.Builder(context)</p>
                  <p className="pl-8">.setTitle("Fecha anterior a hoy")</p>
                  <p className="pl-8">.setMessage("No se puede completar...")</p>
                  <p className="pl-8">.show()</p>
                  <p>{'}'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETUP GUIDE */}
        {activeTab === 'setup' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Rocket className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Cómo llevar "Mi Agenda" a Android Studio</h2>
                  <p className="text-sm text-slate-400">Pasos sencillos para crear el proyecto en tu computadora.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0">1</div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white text-sm">Crea un nuevo proyecto</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Abre Android Studio, selecciona "New Project" y elige <strong>Empty Activity</strong> con Jetpack Compose.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0">2</div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white text-sm">Copia los archivos de código</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Ve a la pestaña "Código", copia el contenido de cada archivo y pégalo en tu proyecto de Android Studio en sus respectivas rutas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ALERT MODAL FOR PAST DATE VALIDATION IN WEB SIMULATOR */}
      {alertModalMsg && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base">Atención Requerida</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {alertModalMsg}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setAlertModalMsg(null)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md"
              >
                Entendido, cambiar fecha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-4 px-4 text-center text-xs text-slate-500">
        <p>Mi Agenda • Android Mobile-First con Kotlin & Jetpack Compose</p>
      </footer>
    </div>
  );
}
