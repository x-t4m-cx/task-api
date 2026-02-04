package com.example.task_api.service;

import com.example.task_api.dto.TaskRequest;
import com.example.task_api.dto.TaskResponse;
import com.example.task_api.entity.Task;
import com.example.task_api.entity.TaskStatus;
import com.example.task_api.mapper.TaskMapper;
import com.example.task_api.repository.TaskRepository;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    public TaskResponse createTack(@Valid TaskRequest request) {
        Task task = taskMapper.toEntity(request);
        return taskMapper.toResponse(taskRepository.save(task));
    }

    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Not found Task with id:" + id));

        return taskMapper.toResponse(task);
    }

    public List<TaskResponse> getAllTasks() {
        return taskRepository
                .findAll().stream()
                .map(taskMapper::toResponse)
                .toList();
    }

    public List<TaskResponse> getTasksByStatus(TaskStatus status) {
        return taskRepository
                .findByStatus(status).stream()
                .map(taskMapper::toResponse)
                .toList();
    }

    public TaskResponse updateTask(Long id, Task taskDetails) {
        Task task = taskRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Not found Task with id:" + id));

        if (taskDetails.getTitle() != null) {
            task.setTitle(taskDetails.getTitle());
        }
        if (taskDetails.getDescription() != null) {
            task.setDescription(taskDetails.getDescription());
        }
        if (taskDetails.getStatus() != null) {
            task.setStatus(taskDetails.getStatus());
        }

        return taskMapper.toResponse(taskRepository.save(task));
    }

    public TaskResponse updateTaskStatus(Long id, TaskStatus status) {
        Task task = taskRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Not found Task with id:" + id));
        task.setStatus(status);
        return taskMapper.toResponse(taskRepository.save(task));
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new RuntimeException("Not found Task with id:" + id);
        }

        taskRepository.deleteById(id);
    }

    public void deleteAllTasks() {
        taskRepository.deleteAll();
    }
}
