package com.falcons.logistics.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private String email;
    private String name;
    private List<String> roles;

    public AuthResponse(String token, String email, String name, List<String> roles) {
        this.token = token;
        this.email = email;
        this.name = name;
        this.roles = roles;
    }
}
