package com.vehiclerental.service;

import com.vehiclerental.model.Admin;
import com.vehiclerental.model.Customer;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AuthService {

    private final CustomerService customerService;
    private final AdminService adminService;

    public AuthService(CustomerService customerService,
                    AdminService adminService) {
        this.customerService = customerService;
        this.adminService = adminService;
    }

    public Customer register(String name, String email, String phone, String password) {

        if (customerService.findByEmail(email) != null) {
            return null;
        }

        Customer customer = new Customer(0, name, email, phone, password);

        return customerService.addCustomer(customer);
    }

    public Object login(String email, String password, String role) {

        if ("admin".equalsIgnoreCase(role)) {

            Admin admin = adminService.findByEmail(email);

            if (admin != null && admin.getPassword().equals(password)) {
                return admin;
            }

            return null;
        }

        Customer customer = customerService.findByEmail(email);

        if (customer != null && customer.getPassword().equals(password)) {
            return customer;
        }

        return null;
    }

    public Map<String, Object> currentUser(int id, String role) {

        if ("admin".equals(role)) {
            Admin admin = adminService.findById(id);
            return admin == null ? null : toUserMap(admin, role);
        }

        Customer customer = customerService.getCustomerById(id);
        return customer == null ? null : toUserMap(customer, role);
    }

    public Map<String, Object> toUserMap(Object user, String role) {

        Map<String, Object> map = new LinkedHashMap<>();

        if (user instanceof Admin admin) {
            map.put("id", admin.getId());
            map.put("name", admin.getName());
            map.put("email", admin.getEmail());
            map.put("phone", admin.getPhone());
        } else {
            Customer customer = (Customer) user;
            map.put("id", customer.getId());
            map.put("name", customer.getName());
            map.put("email", customer.getEmail());
            map.put("phone", customer.getPhone());
        }

        map.put("role", role);
        return map;
    }
}