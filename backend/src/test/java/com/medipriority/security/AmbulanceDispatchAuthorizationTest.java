package com.medipriority.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medipriority.config.SecurityConfig;
import com.medipriority.controller.AllocationController;
import com.medipriority.dto.request.AutoDispatchAmbulanceRequest;
import com.medipriority.dto.response.AmbulanceAllocationResponse;
import com.medipriority.model.AmbulanceAllocation;
import com.medipriority.service.AmbulanceAllocationService;
import com.medipriority.service.BedAllocationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AllocationController.class)
@Import(SecurityConfig.class)
@DisplayName("Ambulance Dispatch Authorization Regression Tests")
class AmbulanceDispatchAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AmbulanceAllocationService ambulanceAllocationService;

    @MockBean
    private BedAllocationService bedAllocationService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @org.junit.jupiter.api.BeforeEach
    void setUp() throws Exception {
        org.mockito.Mockito.doAnswer(invocation -> {
            jakarta.servlet.FilterChain chain = invocation.getArgument(2);
            chain.doFilter(invocation.getArgument(0), invocation.getArgument(1));
            return null;
        }).when(jwtAuthenticationFilter).doFilter(any(), any(), any());
    }

    @Test
    @DisplayName("DISPATCHER is authorized to auto-dispatch an ambulance")
    @WithMockUser(username = "dispatcher@medipriority.com", roles = {"DISPATCHER"})
    void testDispatcherCanAutoDispatch() throws Exception {
        AutoDispatchAmbulanceRequest request = new AutoDispatchAmbulanceRequest(10L);

        AmbulanceAllocationResponse response = new AmbulanceAllocationResponse(
                1L, 10L, "REQ-001", "Jane Doe", 5L, "AMB-01", "ADVANCED",
                "Chief Dispatcher", AmbulanceAllocation.AllocationStatus.ACTIVE,
                LocalDateTime.now(), null, null, LocalDateTime.now()
        );

        when(ambulanceAllocationService.autoDispatch(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/allocations/ambulance/auto")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("ADMIN is forbidden from auto-dispatching an ambulance (403 Forbidden)")
    @WithMockUser(username = "admin@medipriority.com", roles = {"ADMIN"})
    void testAdminForbiddenFromAutoDispatch() throws Exception {
        AutoDispatchAmbulanceRequest request = new AutoDispatchAmbulanceRequest(10L);

        mockMvc.perform(post("/api/allocations/ambulance/auto")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("MEDICAL_OFFICER is forbidden from auto-dispatching an ambulance (403 Forbidden)")
    @WithMockUser(username = "doctor@medipriority.com", roles = {"MEDICAL_OFFICER"})
    void testMedicalOfficerForbiddenFromAutoDispatch() throws Exception {
        AutoDispatchAmbulanceRequest request = new AutoDispatchAmbulanceRequest(10L);

        mockMvc.perform(post("/api/allocations/ambulance/auto")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated request to dispatch ambulance returns 401 Unauthorized")
    void testUnauthenticatedDispatchReturnsUnauthorized() throws Exception {
        AutoDispatchAmbulanceRequest request = new AutoDispatchAmbulanceRequest(10L);

        mockMvc.perform(post("/api/allocations/ambulance/auto")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("ADMIN is forbidden from completing ambulance allocation (403 Forbidden)")
    @WithMockUser(username = "admin@medipriority.com", roles = {"ADMIN"})
    void testAdminForbiddenFromCompletingAmbulance() throws Exception {
        mockMvc.perform(patch("/api/allocations/ambulance/1/complete"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DISPATCHER is authorized to complete ambulance allocation")
    @WithMockUser(username = "dispatcher@medipriority.com", roles = {"DISPATCHER"})
    void testDispatcherCanCompleteAmbulance() throws Exception {
        AmbulanceAllocationResponse response = new AmbulanceAllocationResponse(
                1L, 10L, "REQ-001", "Jane Doe", 5L, "AMB-01", "ADVANCED",
                "Chief Dispatcher", AmbulanceAllocation.AllocationStatus.COMPLETED,
                LocalDateTime.now().minusHours(1), null, LocalDateTime.now(), LocalDateTime.now()
        );

        when(ambulanceAllocationService.complete(any(), any())).thenReturn(response);

        mockMvc.perform(patch("/api/allocations/ambulance/1/complete"))
                .andExpect(status().isOk());
    }
}
